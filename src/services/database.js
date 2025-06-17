const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

class Database {
  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'game_reviews.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection failed:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS games (
        appid INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        developer TEXT,
        publisher TEXT,
        release_date TEXT,
        price TEXT,
        description TEXT,
        header_image TEXT,
        genres TEXT,
        categories TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appid INTEGER,
        recommendationid TEXT,
        author_steamid TEXT,
        playtime_forever INTEGER,
        playtime_at_review INTEGER,
        language TEXT,
        review_text TEXT,
        timestamp_created INTEGER,
        voted_up BOOLEAN,
        votes_up INTEGER,
        weighted_vote_score REAL,
        steam_purchase BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appid) REFERENCES games (appid)
      )`,
      
      `CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appid INTEGER,
        overall_sentiment REAL,
        sentiment_breakdown TEXT,
        positive_aspects TEXT,
        negative_aspects TEXT,
        common_themes TEXT,
        review_count INTEGER,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appid) REFERENCES games (appid)
      )`,
      
      `CREATE TABLE IF NOT EXISTS processing_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appid INTEGER,
        status TEXT DEFAULT 'queued',
        progress INTEGER DEFAULT 0,
        started_at DATETIME,
        completed_at DATETIME,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appid) REFERENCES games (appid)
      )`
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async saveGame(gameData) {
    const {
      appid, name, developer, publisher, release_date,
      price, description, header_image, genres, categories
    } = gameData;

    return this.run(
      `INSERT OR REPLACE INTO games 
       (appid, name, developer, publisher, release_date, price, description, header_image, genres, categories, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        appid, name, developer, publisher, release_date,
        price, description, header_image,
        JSON.stringify(genres), JSON.stringify(categories)
      ]
    );
  }

  async getGame(appid) {
    const row = await this.get('SELECT * FROM games WHERE appid = ?', [appid]);
    if (row) {
      return {
        ...row,
        genres: JSON.parse(row.genres || '[]'),
        categories: JSON.parse(row.categories || '[]')
      };
    }
    return null;
  }

  async saveReviews(appid, reviews) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO reviews 
      (appid, recommendationid, author_steamid, playtime_forever, playtime_at_review, 
       language, review_text, timestamp_created, voted_up, votes_up, weighted_vote_score, steam_purchase)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        reviews.forEach(review => {
          stmt.run([
            appid,
            review.recommendationid,
            review.author.steamid,
            review.author.playtime_forever,
            review.author.playtime_at_review,
            review.language,
            review.review,
            review.timestamp_created,
            review.voted_up,
            review.votes_up,
            review.weighted_vote_score,
            review.steam_purchase
          ]);
        });

        this.db.run('COMMIT', (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
          } else {
            resolve();
          }
        });
      });

      stmt.finalize();
    });
  }

  async getReviews(appid, limit = null) {
    const sql = limit 
      ? 'SELECT * FROM reviews WHERE appid = ? ORDER BY timestamp_created DESC LIMIT ?'
      : 'SELECT * FROM reviews WHERE appid = ? ORDER BY timestamp_created DESC';
    
    const params = limit ? [appid, limit] : [appid];
    return this.all(sql, params);
  }

  async saveSummary(appid, summaryData) {
    const {
      overall_sentiment, sentiment_breakdown, positive_aspects,
      negative_aspects, common_themes, review_count
    } = summaryData;

    return this.run(
      `INSERT OR REPLACE INTO summaries 
       (appid, overall_sentiment, sentiment_breakdown, positive_aspects, negative_aspects, common_themes, review_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appid,
        overall_sentiment,
        JSON.stringify(sentiment_breakdown),
        JSON.stringify(positive_aspects),
        JSON.stringify(negative_aspects),
        JSON.stringify(common_themes),
        review_count
      ]
    );
  }

  async getSummary(appid) {
    const row = await this.get('SELECT * FROM summaries WHERE appid = ? ORDER BY generated_at DESC LIMIT 1', [appid]);
    if (row) {
      return {
        ...row,
        sentiment_breakdown: JSON.parse(row.sentiment_breakdown),
        positive_aspects: JSON.parse(row.positive_aspects),
        negative_aspects: JSON.parse(row.negative_aspects),
        common_themes: JSON.parse(row.common_themes)
      };
    }
    return null;
  }

  async getRecentGames(limit = 10) {
    return this.all(`
      SELECT g.*, s.overall_sentiment, s.review_count, s.generated_at as last_analyzed
      FROM games g
      LEFT JOIN summaries s ON g.appid = s.appid
      WHERE s.generated_at IS NOT NULL
      ORDER BY s.generated_at DESC
      LIMIT ?
    `, [limit]);
  }

  async addToProcessingQueue(appid) {
    return this.run(
      'INSERT INTO processing_queue (appid, status) VALUES (?, "queued")',
      [appid]
    );
  }

  async updateProcessingStatus(appid, status, progress = null, errorMessage = null) {
    const params = [status];
    let sql = 'UPDATE processing_queue SET status = ?';
    
    if (progress !== null) {
      sql += ', progress = ?';
      params.push(progress);
    }
    
    if (status === 'processing' && !errorMessage) {
      sql += ', started_at = CURRENT_TIMESTAMP';
    } else if (status === 'completed' && !errorMessage) {
      sql += ', completed_at = CURRENT_TIMESTAMP';
    }
    
    if (errorMessage) {
      sql += ', error_message = ?';
      params.push(errorMessage);
    }
    
    sql += ' WHERE appid = ? AND status != "completed"';
    params.push(appid);
    
    return this.run(sql, params);
  }

  async getProcessingQueue() {
    return this.all(`
      SELECT pq.*, g.name as game_name
      FROM processing_queue pq
      LEFT JOIN games g ON pq.appid = g.appid
      WHERE pq.status != 'completed'
      ORDER BY pq.created_at ASC
    `);
  }

  async clearCache() {
    await this.run('DELETE FROM summaries');
    await this.run('DELETE FROM reviews');
    await this.run('DELETE FROM processing_queue');
    console.log('Cache cleared successfully');
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
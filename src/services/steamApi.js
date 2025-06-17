const axios = require('axios');

class SteamAPI {
  constructor() {
    this.baseURL = 'https://store.steampowered.com/api';
    this.searchURL = 'https://steamcommunity.com/actions';
  }

  async searchGames(query, maxResults = 20) {
    try {
      const response = await axios.get('https://steamcommunity.com/actions/SearchApps', {
        params: {
          text: query,
          max_results: maxResults
        }
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data.map(app => ({
          appid: app.appid,
          name: app.name,
          header_image: `https://cdn.akamai.steamstatic.com/steam/apps/${app.appid}/header.jpg`
        }));
      }

      return [];
    } catch (error) {
      console.error('Steam search failed:', error);
      throw new Error('Failed to search Steam games');
    }
  }

  async getGameDetails(appId) {
    try {
      const response = await axios.get(`${this.baseURL}/appdetails`, {
        params: {
          appids: appId,
          filters: 'basic'
        }
      });

      const gameData = response.data[appId];
      if (gameData && gameData.success && gameData.data) {
        const data = gameData.data;
        return {
          appid: appId,
          name: data.name,
          developer: data.developers ? data.developers[0] : 'Unknown',
          publisher: data.publishers ? data.publishers[0] : 'Unknown',
          release_date: data.release_date ? data.release_date.date : 'Unknown',
          price: data.is_free ? 'Free' : (data.price_overview ? data.price_overview.final_formatted : 'Price not available'),
          description: data.short_description || 'No description available',
          header_image: data.header_image,
          genres: data.genres || [],
          categories: data.categories || []
        };
      }

      throw new Error('Game not found');
    } catch (error) {
      console.error('Failed to get game details:', error);
      throw new Error('Failed to fetch game details');
    }
  }

  async getGameReviews(appId, options = {}) {
    const {
      maxReviews = 1000,
      language = 'english',
      reviewType = 'all'
    } = options;

    try {
      const reviews = [];
      let cursor = '*';
      const batchSize = 100;

      while (reviews.length < maxReviews && cursor !== null) {
        const response = await axios.get('https://store.steampowered.com/appreviews/' + appId, {
          params: {
            json: 1,
            cursor: cursor,
            language: language,
            filter: 'recent',
            review_type: reviewType,
            num_per_page: Math.min(batchSize, maxReviews - reviews.length)
          }
        });

        if (response.data && response.data.reviews) {
          const batchReviews = response.data.reviews.map(review => ({
            recommendationid: review.recommendationid,
            author: {
              steamid: review.author.steamid,
              playtime_forever: review.author.playtime_forever,
              playtime_last_two_weeks: review.author.playtime_last_two_weeks,
              playtime_at_review: review.author.playtime_at_review,
              last_played: review.author.last_played
            },
            language: review.language,
            review: review.review,
            timestamp_created: review.timestamp_created,
            timestamp_updated: review.timestamp_updated,
            voted_up: review.voted_up,
            votes_up: review.votes_up,
            votes_funny: review.votes_funny,
            weighted_vote_score: review.weighted_vote_score,
            comment_count: review.comment_count,
            steam_purchase: review.steam_purchase,
            received_for_free: review.received_for_free,
            written_during_early_access: review.written_during_early_access
          }));

          reviews.push(...batchReviews);
          cursor = response.data.cursor;

          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          break;
        }
      }

      return reviews;
    } catch (error) {
      console.error('Failed to get game reviews:', error);
      throw new Error('Failed to fetch game reviews');
    }
  }

  async getRateLimitedRequest(url, params, delay = 1000) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return axios.get(url, { params });
  }
}

module.exports = SteamAPI;
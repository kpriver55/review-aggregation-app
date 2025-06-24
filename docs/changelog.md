# Changelog

## 2025-06-24

### Issues Addressed
- Investigated D-Bus connection errors appearing on application startup in WSL environment
  - Confirmed these are harmless Electron system integration attempts
  - No code changes required - errors can be safely ignored
  - Existing documentation in getting-started.md already covers this issue

### Bug Fixes
- Fixed Steam API review fetching error in `src/services/steamApi.js`
  - Added proper User-Agent headers to prevent API blocking
  - Improved error handling with specific error messages for different failure scenarios
  - Added request timeout (10 seconds) to prevent hanging requests
  - Enhanced logging for better debugging of API issues
  - Added validation for Steam API response success status
  - Increased rate limiting delay from 100ms to 250ms between requests
  - Added maximum request limit (20) to prevent infinite loops
  - Fixed review fetching functionality - now successfully retrieves game reviews for analysis

### Features
- Enhanced progress indicators during game analysis to improve user confidence
  - Created new `AnalysisProgress` component with detailed step-by-step progress display
  - Added real-time progress updates via IPC events from main process to renderer
  - Implemented time estimation and progress percentage for each analysis step
  - Enhanced `ProcessingQueue` component to show real processing queue data from database
  - Added visual progress bars, status icons, and estimated time remaining
  - Improved user experience with detailed messages for each processing phase:
    - Game information fetching
    - Steam API review collection 
    - AI analysis and summary generation
  - Added progress persistence in database for queue management
  - Replaced simple loading spinner with comprehensive progress tracking system
// Vercel API handler for the Teams bot
let botApp;
let initPromise;

/**
 * Initialize the bot app once and cache it
 */
async function initializeBot() {
  if (botApp) return botApp;
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const bot = require('../dist/index.js');
        botApp = bot.default || bot;
        console.log('✅ Bot initialized');
        return botApp;
      } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        throw error;
      }
    })();
  }
  
  return initPromise;
}

/**
 * Vercel serverless function handler
 */
module.exports = async (req, res) => {
  try {
    // Initialize bot on first request
    const app = await initializeBot();

    // Health check endpoint
    if (req.method === 'GET' && req.url === '/api') {
      return res.status(200).json({ status: 'Bot is running ✅' });
    }

    // Teams messaging endpoint
    if (req.method === 'POST' && req.url === '/api') {
      // The Teams.ai App framework should have Express middleware
      // or a method to handle the activity
      if (!req.body || !req.body.type) {
        return res.status(400).json({ error: 'Invalid activity' });
      }

      // Send 200 immediately to acknowledge
      res.status(200).end();

      console.log('📨 Received activity:', req.body.type);
      
      // Process the activity in the background
      // The app should handle routing to the appropriate event handler
      if (app.adapter && app.adapter.processActivity) {
        await app.adapter.processActivity(req, res);
      }
      
      return;
    }

    // 404 for other routes
    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

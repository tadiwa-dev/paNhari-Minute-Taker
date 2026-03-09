// Vercel API handler for Teams bot
const { TeamsAdapter } = require('@microsoft/teams.ai');
const { BotFrameworkAdapter, TurnContext } = require('botbuilder');

let botApp;
let adapter;
let initPromise;

/**
 * Initialize the bot app and adapter
 */
async function initializeBot() {
  if (botApp) return botApp;
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Import the bot app
        const botModule = require('../dist/index.js');
        botApp = botModule.default || botModule;
        
        // Also initialize storage
        if (botModule.initializeStorage) {
          await botModule.initializeStorage();
        }
        
        console.log('✅ Bot initialized for Vercel');
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

    // Health check for GET requests
    if (req.method === 'GET') {
      return res.status(200).json({ status: 'Bot is running ✅' });
    }

    // Only handle POST requests to the API
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate the request has an activity
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Send immediate 200 response to Teams
    res.status(200).end();

    // Log the activity type
    const activityType = req.body.type || 'unknown';
    console.log(`📨 Processing activity: ${activityType}`);

    // Get the adapter from the app if available
    // The @microsoft/teams.ai SDK stores the adapter internally
    if (app.adapter) {
      try {
        // Process the activity through the Teams bot adapter
        await app.adapter.processActivity(req, res, async (context) => {
          // The activity is now processed by the app's handlers
        });
      } catch (error) {
        console.error('Adapter processing error:', error);
      }
    } else {
      // Fallback: try to access the app's internal adapter
      console.warn('Adapter not directly accessible, checking for alternative methods');
      console.log('Request body:', JSON.stringify(req.body).substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Handler error:', error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
};

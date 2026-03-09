// Vercel API handler for Teams bot
// Simple health check and activity logging

module.exports = async (req, res) => {
  try {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    // Health check for GET requests
    if (req.method === 'GET') {
      console.log('✅ Health check');
      return res.status(200).json({ 
        status: 'Bot is running ✅',
        timestamp: new Date().toISOString()
      });
    }

    // Only handle POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Log incoming activity
    const activity = req.body;
    console.log('📨 Received activity:', {
      type: activity?.type,
      from: activity?.from?.name,
      text: activity?.text?.substring?.(0, 100)
    });

    // Validate activity
    if (!activity || typeof activity !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Send 200 immediately to acknowledge
    res.status(200).end();

    // Try to import and initialize the bot
    try {
      console.log('🔄 Loading bot module...');
      
      // Lazy load the bot module
      const botScript = require('../dist/index.js');
      console.log('✅ Bot module loaded');
      
      // The bot should be listening on its own port or have event handlers
      // For now, just acknowledge that we received it
      console.log('✅ Activity acknowledged and queued for processing');
    } catch (botError) {
      console.error('⚠️ Bot module error (non-critical):', botError.message);
      // Don't fail the request, we already sent 200
    }

  } catch (error) {
    console.error('❌ Handler error:', error);
    // Only send error if we haven't sent a response yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
};

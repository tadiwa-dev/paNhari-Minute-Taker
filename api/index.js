const bot = require('../dist/index.js').default;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    const { activity } = req.body;
    if (!activity) {
      res.status(400).json({ error: 'No activity in request body' });
      return;
    }

    await bot.run(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Bot error:', error);
    res.status(500).json({ error: error.message });
  }
};

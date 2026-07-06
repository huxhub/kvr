import * as Settings from '../models/Settings.js';

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findByKey('global');
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.createDefault('global');
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.upsert('global', req.body);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

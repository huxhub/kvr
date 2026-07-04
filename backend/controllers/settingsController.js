import Settings from '../models/Settings.js';

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({ key: 'global' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const { companyName, companyPhone, companyEmail, companyAddress, branches, theme, enableAlerts } = req.body;
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = new Settings({ key: 'global' });
    }

    if (companyName !== undefined) settings.companyName = companyName;
    if (companyPhone !== undefined) settings.companyPhone = companyPhone;
    if (companyEmail !== undefined) settings.companyEmail = companyEmail;
    if (companyAddress !== undefined) settings.companyAddress = companyAddress;
    if (branches !== undefined) settings.branches = branches;
    if (theme !== undefined) settings.theme = theme;
    if (enableAlerts !== undefined) settings.enableAlerts = enableAlerts;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

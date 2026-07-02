import Audit from '../models/Audit.js';

export const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await Audit.find({}, '-__v')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const incoming = req.body;
    const logsToInsert = Array.isArray(incoming) ? incoming : [incoming];

    const inserted = await Audit.insertMany(logsToInsert);
    res.status(201).json({ message: 'Logs saved', count: inserted.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

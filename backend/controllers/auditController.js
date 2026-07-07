import * as Audit from '../models/Audit.js';

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    
    // Enforce strict limit <= 25
    const activeLimit = Math.min(25, Math.max(1, limit));

    const sessionUser = req.session.user;
    const isBranchRestricted = sessionUser?.role !== 'ADMIN';
    const userBranch = sessionUser?.branch;

    let logs, totalCount;

    if (isBranchRestricted && userBranch) {
      // Non-Admin: only see audit logs for their branch's vehicles
      [logs, totalCount] = await Promise.all([
        Audit.findByBranch(userBranch, page, activeLimit),
        Audit.countByBranch(userBranch)
      ]);
    } else {
      // ADMIN, CRM, etc.: see all audit logs
      [logs, totalCount] = await Promise.all([
        Audit.findAll(page, activeLimit),
        Audit.countAll()
      ]);
    }

    // Expose headers for cross-origin or local clients
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
    res.setHeader('X-Total-Count', totalCount.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', activeLimit.toString());

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const incoming = req.body;
    const logsToInsert = Array.isArray(incoming) ? incoming : [incoming];

    const count = await Audit.insertMany(logsToInsert);
    res.status(201).json({ message: 'Logs saved', count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearAuditLogs = async (req, res) => {
  try {
    await Audit.deleteAll();
    res.json({ message: 'All audit logs cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

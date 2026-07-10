import bcrypt from 'bcrypt';
import * as User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    if (!req.session.user || (req.session.user.role !== 'ADMIN' && req.session.user.role !== 'BRANCH_MANAGER')) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view users.' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    
    // Enforce strict limit <= 15
    const activeLimit = Math.min(15, Math.max(1, limit));

    const isBranchManager = req.session.user.role === 'BRANCH_MANAGER';
    const branchFilter = (isBranchManager && req.session.user.branch !== 'All Branches') ? req.session.user.branch : null;

    const [users, totalCount] = await Promise.all([
      User.findAll(page, activeLimit, branchFilter),
      User.countAll(branchFilter)
    ]);

    // Expose headers for cross-origin or local clients
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
    res.setHeader('X-Total-Count', totalCount.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', activeLimit.toString());

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only Administrator can manage users' });
    }

    const data = { ...req.body };

    if (!data.password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash password before storing
    data.password = await bcrypt.hash(data.password, 12);

    const saved = await User.create(data);
    res.status(201).json(saved);
  } catch (error) {
    // MySQL ER_DUP_ENTRY error code = 1062
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const isSelfUpdate = req.session.user && req.session.user.username.toLowerCase() === username.toLowerCase();
    const isAdmin = req.session.user && req.session.user.role === 'ADMIN';

    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only Administrator can manage users' });
    }

    const data = { ...req.body };

    // If a new password is provided, hash it before saving
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const updated = await User.updateByUsername(username, data);

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sync session user if updating their own profile
    if (req.session && req.session.user && req.session.user.username.toLowerCase() === username.toLowerCase()) {
      req.session.user = {
        username: updated.username,
        role: updated.role,
        name: updated.name,
        branch: updated.branch,
        email: updated.email || '',
      };
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only Administrator can manage users' });
    }

    const { username } = req.params;
    const deleted = await User.deleteByUsername(username);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

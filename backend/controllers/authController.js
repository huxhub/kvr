import User from '../models/User.js';

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const sessionUser = {
      username: user.username,
      role: user.role,
      name: user.name,
      branch: user.branch
    };

    // Store user in server-side session
    req.session.user = sessionUser;

    res.json(sessionUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/me — restore session on page refresh
export const me = (req, res) => {
  if (req.session && req.session.user) {
    return res.json(req.session.user);
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

// POST /api/auth/logout — destroy session and clear cookie
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('kvr.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

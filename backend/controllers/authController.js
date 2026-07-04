import bcrypt from 'bcrypt';
import User from '../models/User.js';

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Support both bcrypt hashes and legacy plain-text passwords during migration
    let passwordValid = false;
    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    if (isHashed) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text check — auto-upgrade to hash on successful login
      passwordValid = (user.password === password);
      if (passwordValid) {
        const hash = await bcrypt.hash(password, 12);
        await User.updateOne({ _id: user._id }, { $set: { password: hash } });
        console.log(`[Auth] Auto-upgraded plain-text password to bcrypt hash for user: ${user.username}`);
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const sessionUser = {
      username: user.username,
      role: user.role,
      name: user.name,
      branch: user.branch,
    };

    // Regenerate session ID on privilege change to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.user = sessionUser;
      res.json(sessionUser);
    });
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

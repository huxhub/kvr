import User from '../models/User.js';

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

    res.json({
      username: user.username,
      role: user.role,
      name: user.name,
      branch: user.branch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

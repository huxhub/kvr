import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-__v -createdAt -updatedAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    const { __v, ...safe } = saved.toObject();
    res.status(201).json(safe);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const updated = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $set: req.body },
      { returnDocument: 'after', select: '-__v' }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await User.findOneAndDelete({ username: username.toLowerCase() });

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

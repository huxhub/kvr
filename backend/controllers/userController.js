import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    // Never return the password field to the client
    const users = await User.find({}, '-password -__v -createdAt -updatedAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash password before storing
    data.password = await bcrypt.hash(data.password, 12);

    const newUser = new User(data);
    const saved = await newUser.save();
    const { password, __v, ...safe } = saved.toObject();
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
    const data = { ...req.body };

    // If a new password is provided, hash it before saving
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const updated = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $set: data },
      { returnDocument: 'after', select: '-password -__v' }
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

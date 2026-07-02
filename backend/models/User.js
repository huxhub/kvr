import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'CRM', 'FINANCE', 'TMA', 'ACCOUNTS', 'INSURANCE', 'REGISTRATION', 'TMGA', 'PDI', 'DELIVERY', 'MANAGEMENT']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    default: 'Perinthalmanna'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;

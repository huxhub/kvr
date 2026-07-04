import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global'
  },
  companyName: {
    type: String,
    required: true,
    default: 'KVR TATA'
  },
  companyPhone: {
    type: String,
    default: '+91 98470 12345'
  },
  companyEmail: {
    type: String,
    default: 'support@kvrgroup.com'
  },
  companyAddress: {
    type: String,
    default: 'KVR Group, NH 66, Perinthalmanna, Kerala'
  },
  branches: {
    type: [String],
    default: ['Perinthalmanna']
  },
  theme: {
    type: String,
    default: 'light'
  },
  enableAlerts: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

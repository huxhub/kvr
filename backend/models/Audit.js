import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  chassisNumber: { type: String, required: true },
  customerName: { type: String },
  updatedBy: { type: String },
  department: { type: String },
  previousStatus: { type: String },
  newStatus: { type: String },
  remarks: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Audit = mongoose.model('Audit', auditSchema);

export default Audit;

import express from 'express';
import { getAuditLogs, createAuditLog, clearAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

router.get('/', getAuditLogs);
router.post('/', createAuditLog);
router.delete('/', clearAuditLogs);

export default router;

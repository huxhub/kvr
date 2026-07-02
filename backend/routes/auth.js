import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/', (req, res) => {
  req.url = '/login';
  router.handle(req, res);
});

export default router;

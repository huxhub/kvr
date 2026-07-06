import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:username', updateUser);
router.delete('/:username', deleteUser);

export default router;

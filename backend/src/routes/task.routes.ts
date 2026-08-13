import { Router } from 'express';
import { createTask, updateTask, moveTask, deleteTask, getTasksByPriority } from '../controllers/task.controller.js';

const router = Router();

router.get('/', getTasksByPriority); 
router.post('/', createTask);
router.patch('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
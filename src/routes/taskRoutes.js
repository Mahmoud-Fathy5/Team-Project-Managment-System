import express from 'express';
import {
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getAllTasks);
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask);

export default router;

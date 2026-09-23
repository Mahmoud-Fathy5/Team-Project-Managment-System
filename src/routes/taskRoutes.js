import express from 'express';
import {
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import taskMiddleware from '../middlewares/taskMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use('/:id', taskMiddleware);

router.get('/', getAllTasks);

router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask);

export default router;

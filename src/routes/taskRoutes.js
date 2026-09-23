import express from 'express';
import {
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllTasks);
router
  .route('/:id', authMiddleware)
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;

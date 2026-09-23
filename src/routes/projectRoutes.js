import express from 'express';
import {
  addMembersToProject,
  createProject,
  deleteProject,
  getAllMembers,
  getAllProjects,
  getAllProjectTasks,
  getProject,
  updateProject,
} from '../controllers/projectController.js';
import { addTask } from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/', authMiddleware).post(createProject).get(getAllProjects);

router
  .route('/:id', authMiddleware)
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

router
  .route('/:id/members', authMiddleware)
  .post(addMembersToProject)
  .get(getAllMembers);

router
  .route('/:id/tasks', authMiddleware)
  .get(getAllProjectTasks)
  .post(addTask);

export default router;

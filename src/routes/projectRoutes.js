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
import projectMiddleware from '../middlewares/projectMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use('/:id', projectMiddleware);

router.route('/').post(createProject).get(getAllProjects);

router.route('/:id').get(getProject).patch(updateProject).delete(deleteProject);

router.route('/:id/members').post(addMembersToProject).get(getAllMembers);

router.route('/:id/tasks').get(getAllProjectTasks).post(addTask);

export default router;

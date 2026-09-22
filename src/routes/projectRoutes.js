import express from 'express';
import {
  addMembersToProject,
  createProject,
  deleteProject,
  getAllMembers,
  getAllProjectTasks,
  getProject,
  updateProject,
} from '../controllers/projectController.js';
import { addTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/', createProject);

router.route('/:id').get(getProject).patch(updateProject).delete(deleteProject);

router.route('/:id/members').post(addMembersToProject).get(getAllMembers);

router.route('/:id/tasks').get(getAllProjectTasks).post(addTask);

export default router;

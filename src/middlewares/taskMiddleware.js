import { prisma } from '../config/prisma';

const taskMiddleware = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { projectMembers: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'task does not exist',
      });
    }

    const userId = req.user.id;
    const { project } = task;

    const isMember = project.projectMembers.some((m) => m.userId === userId);

    if (!isMember) {
      return res.status(403).json({
        status: 'fail',
        message: 'you do not have access to this task',
      });
    }
    req.task = task;
    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

export default taskMiddleware;

import { prisma } from '../config/prisma.js';

const projectMiddleware = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectMembers: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'project does not exist',
      });
    }
    const userId = req.user.id;
    const isMember = project.projectMembers.some((m) => m.userId === userId);

    if (!isMember) {
      return res.status(403).json({
        status: 'fail',
        message: 'you do not have access to this project',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

export default projectMiddleware;

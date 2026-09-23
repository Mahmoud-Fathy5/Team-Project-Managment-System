import { prisma } from '../config/prisma.js';

const createProject = async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id;
  if (!name || !description || !ownerId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please Provide all the necessary data',
    });
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  try {
    if (!owner) {
      return res.status(404).json({
        status: 'fail',
        message: 'Owner does not exist',
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        ownerId,
        description,
        projectMembers: {
          create: {
            userId: ownerId,
          },
        },
      },
    });
    return res.status(201).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        projectMembers: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        tasks: true,
        projectMembers: {
          select: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'project does not exist',
      });
    }
    const progress = project.tasks.filter(
      (task) => task.status === 'DONE',
    ).length;
    return res.status(200).json({
      status: 'success',
      data: { project, progress },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.deleteMany({
      where: { id: req.params.id },
    });
    if (project.count === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'project does not exist',
      });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const addMembersToProject = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({
      status: 'fail',
      message: 'please enter the userId',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'user does not exist',
      });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'project does not exist',
      });
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId,
        },
      },
    });
    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: 'user is already a member',
      });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        userId,
        projectId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            age: true,
          },
        },
      },
    });
    return res.status(201).json({
      status: 'success',
      data: { member: newMember.user },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name && !description) {
    return res.status(400).json({
      status: 'fail',
      message: 'provide at least a name or a decription',
    });
  }

  try {
    const updatedProject = await prisma.project.updateManyAndReturn({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });
    if (updatedProject.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project does not exist',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { project: updatedProject[0] },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllMembers = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'project does not exist',
      });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      select: {
        user: {
          select: {
            name: true,
            age: true,
            email: true,
            id: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { members },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllProjectTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: id },
    });
    return res.status(200).json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  const { id } = req.user;
  try {
    const projects = await prisma.project.findMany({
      where: {
        projectMembers: {
          some: {
            userId: id,
          },
        },
      },
    });
    return res.status(200).json({
      status: 'success',
      data: { projects },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export {
  createProject,
  getProject,
  deleteProject,
  addMembersToProject,
  updateProject,
  getAllMembers,
  getAllProjectTasks,
  getAllProjects,
};

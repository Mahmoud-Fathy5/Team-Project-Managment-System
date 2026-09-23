import { prisma } from '../config/prisma.js';

const validPri = ['LOW', 'MEDIUM', 'HIGH'];

const getAllTasks = async (req, res) => {
  const userId = req.user.id;
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId },
    });
    return res.status(200).json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

const addTask = async (req, res) => {
  const { id } = req.params;
  const { name, description, priority, assignedToId } = req.body;

  if (!name || !description || !priority) {
    return res.status(400).json({
      status: 'fail',
      message: 'please provide the name, the description and the priority',
    });
  }
  if (!validPri.includes(priority.toUpperCase())) {
    return res.status(400).json({
      status: 'fail',
      message: 'Priority should be LOW or MEDIUM or HIGH only',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'user does not exist',
      });
    }
    const project = req.project;
    const isProjectMember = project.projectMembers.some(
      (m) => m.userId === assignedToId,
    );

    if (!isProjectMember) {
      return res.status(403).json({
        status: 'fail',
        message: 'user must be a member of this project',
      });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        projectId: id,
        status: 'TODO',
        priority: priority.toUpperCase(),
        assignedToId: assignedToId,
      },
    });
    return res.status(201).json({
      status: 'success',
      data: { task },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

const getTask = async (req, res) => {
  const task = req.task;

  return res.status(200).json({
    status: 'success',
    data: { task },
  });
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { status, assignedToId, name, description, priority } = req.body;

  if (!status && !assignedToId && !name && !description && !priority) {
    return res.status(400).json({
      status: 'fail',
      message: 'provide at least one property to change',
    });
  }
  if (priority && !validPri.includes(priority.toUpperCase())) {
    return res.status(400).json({
      status: 'fail',
      message: 'Priority should be LOW or MEDIUM or HIGH only',
    });
  }

  try {
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!user) {
        return res.status(400).status({
          status: 'fail',
          message: 'user does not exist',
        });
      }
      const isProjectMember = req.project.projectMembers.some(
        (m) => m.userId === assignedToId,
      );

      if (!isProjectMember) {
        return res.status(403).json({
          status: 'fail',
          message: 'user must be a member of this project',
        });
      }
    }
    const updatedTask = await prisma.task.updateManyAndReturn({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(priority !== undefined && { priority: priority.toUpperCase() }),
      },
    });
    if (updatedTask.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'task does not exist',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { task: updatedTask[0] },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

export { addTask, getAllTasks, getTask, deleteTask, updateTask };

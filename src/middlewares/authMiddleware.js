import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const authMiddleware = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'not authorized',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
      },
    });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'not authorized',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'not authorized',
    });
  }
};

export default authMiddleware;

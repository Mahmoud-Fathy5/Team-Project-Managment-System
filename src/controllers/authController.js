import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateTokens.js';

const register = async (req, res) => {
  const { name, email, password, age } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'fail',
      messgae: 'name, email and password are required',
    });
  }
  try {
    const userExist = await prisma.user.findUnique({
      where: { email },
    });
    if (userExist) {
      return res.status(400).json({
        status: 'fail',
        message: 'user with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        age,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedRefreshToken: hashedToken,
      },
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10,
      sameSite: 'strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
    });

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email,
          name,
          age,
          token: {
            refreshToken,
            accessToken,
          },
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        status: 'fail',
        message: 'invalid email or password',
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: hashedToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10,
      sameSite: 'strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email,
          name: user.name,
          age: user.age,
          token: {
            refreshToken,
            accessToken,
          },
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

const logout = async (req, res) => {
  const { id } = req.user;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  await prisma.user.update({
    where: { id },
    data: { hashedRefreshToken: null },
  });

  return res.status(200).json({
    status: 'success',
    message: 'logged out successfully',
  });
};

const refresh = async (req, res) => {
  const reqRefreshToken = req.cookies?.refreshToken;

  if (!reqRefreshToken) {
    return res.status(401).json({
      status: 'fail',
      message: 'no refresh token',
    });
  }

  try {
    const decoded = jwt.verify(
      reqRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const reqHashed = crypto
      .createHash('sha256')
      .update(reqRefreshToken)
      .digest('hex');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        hashedRefreshToken: true,
        email: true,
        age: true,
        name: true,
      },
    });

    if (!user || user.hashedRefreshToken !== reqHashed) {
      return res.status(401).json({
        status: 'fail',
        message: 'invalid token',
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: hashedToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10,
      sameSite: 'strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'invalid token',
    });
  }
};

export { register, login, logout, refresh };

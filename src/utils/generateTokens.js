import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) => {
  const payLoad = { id: userId };
  return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10m',
  });
};

const generateRefreshToken = (userId) => {
  const payLoad = { id: userId };
  return jwt.sign(payLoad, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

export { generateAccessToken, generateRefreshToken };

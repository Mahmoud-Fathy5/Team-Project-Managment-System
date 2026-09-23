import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import projectRouter from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import authRouter from './routes/authRoutes.js';

const app = express();

app.use(cookieParser());

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/auth', authRouter);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'page does not exist',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'server error';

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

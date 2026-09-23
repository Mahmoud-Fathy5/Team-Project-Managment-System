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
export default app;

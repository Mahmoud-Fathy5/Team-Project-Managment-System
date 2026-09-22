import express from 'express';
import morgan from 'morgan';

import projectRouter from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);

export default app;

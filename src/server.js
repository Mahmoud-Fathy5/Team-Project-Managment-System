import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import { connectDB } from './config/prisma.js';

connectDB();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

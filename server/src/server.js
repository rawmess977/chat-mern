import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.router.js';
import messageRouter from './routes/message.route.js';
dotenv.config();
const app = express();


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);



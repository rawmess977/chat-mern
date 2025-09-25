import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.router.js';
import messageRouter from './routes/message.route.js';
import path from 'path';
import { connectDB } from './lib/db.js';
dotenv.config();
const app = express();

const __dirname = path.resolve();
console.log(__dirname)


app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);


// make ready for production

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../client/dist"))); //“Hey, serve everything in the client/dist folder as static files (JS, CSS, images).” This is where your built React app lives after npm run build.
  
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html")); //👉 If the request is NOT an API route (like /api/users), just send back index.html.
  } );
}
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDB();
});
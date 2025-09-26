import mongoose from 'mongoose';


export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ MongoDB connected: ', conn.connection.host);
    return conn;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
    // process.exit(1);
    throw error; // pass error back to the server.js so it can handle shutdown
  }
}
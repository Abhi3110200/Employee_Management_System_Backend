import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  const server = app.listen(PORT, () => {
    console.log(`[Server] Server listening on port http://localhost:${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('[Server] Database connection error:', error);
  }
};

startServer();

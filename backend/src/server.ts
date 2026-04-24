import * as dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './infrastructure/database/mongoose';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL: GEMINI_API_KEY is not defined in environment variables.');
    process.exit(1);
  }

  await connectDatabase(MONGODB_URI);

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Zenyvra AI Backend running on http://localhost:${PORT}`);
  });
};

startServer();

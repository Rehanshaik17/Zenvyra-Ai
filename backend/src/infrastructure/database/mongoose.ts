import mongoose from 'mongoose';

export const connectDatabase = async (uri: string) => {
  if (uri && !uri.includes('cluster0.1rgf0bw.mongodb.net')) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB Connected Successfully to Remote URI');
      return;
    } catch (error) {
      console.warn('Could not connect to configured MONGODB_URI. Falling back to in-memory MongoDB...');
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('✨ [Dev Mode] In-Memory MongoDB Connected Successfully:', memUri);
  } catch (memError) {
    console.error('Failed to start in-memory MongoDB:', memError);
    process.exit(1);
  }
};

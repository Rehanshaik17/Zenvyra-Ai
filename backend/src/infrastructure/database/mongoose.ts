import mongoose from 'mongoose';

export const connectDatabase = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

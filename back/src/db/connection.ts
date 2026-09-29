import mongoose, { mongo } from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const connect = async (): Promise<mongo.Db> => {
  if (!MONGO_URI) throw new Error("MONGO_URI is missing. Set it on .env");

  await mongoose.connect(MONGO_URI, { autoIndex: false });
  return mongoose.connection.db!;
};

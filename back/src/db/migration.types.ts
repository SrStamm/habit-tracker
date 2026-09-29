import { mongo } from "mongoose";

export interface Migration {
  id: string;
  up(db: mongo.Db): Promise<void>;
  down?(db: mongo.Db): Promise<void>;
}

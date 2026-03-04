import { type ClientSession } from "mongoose";
import { User } from "@entities/User.js";
import { type IUserRepository } from "@port/driven/IUserRepository.js";
import { MongoUserModel } from "./models/MongoUserModel.js";

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly session?: ClientSession) {}

  async save(user: User): Promise<void> {
    await MongoUserModel.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        email: user.email,
      },
      { upsert: true, ...(this.session ? { session: this.session } : {}) }
    );
  }

  async findById(id: string): Promise<User | null> {
    const query = MongoUserModel.findById(id);
    if (this.session) query.session(this.session);
    const doc = await query;
    if (!doc) return null;
    return new User(
      doc._id as string,
      doc.name!,
      doc.email!
    );
  }
}

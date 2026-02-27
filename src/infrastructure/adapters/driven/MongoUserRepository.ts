import { model, Schema, type ClientSession } from "mongoose";
import { User } from "@entities/User.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";

const UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  borrowedBookIds: [String],
});

const UserModel = model("User", UserSchema);

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly session?: ClientSession) {}

  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        email: user.email,
        borrowedBookIds: user.borrowedBookIds,
      },
      { upsert: true, ...(this.session ? { session: this.session } : {}) }
    );
  }

  async findById(id: string): Promise<User | null> {
    const query = UserModel.findById(id);
    if (this.session) query.session(this.session);
    const doc = await query;
    if (!doc) return null;
    return new User(
      doc._id as string,
      doc.name!,
      doc.email!,
      doc.borrowedBookIds as string[]
    );
  }
}

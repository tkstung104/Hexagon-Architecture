import { model, Schema } from "mongoose";
import { User } from "../../../domain/entities/User.js";
import type { IUserRepository } from "../../../domain/ports/driven/IUserRepository.js";

// Define Schema for User
const UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  borrowedBookIds: [String],
});

const UserModel = model("User", UserSchema);

// Implement Adapter
export class MongoUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id,
      { 
        name: user.name, 
        email: user.email, 
        borrowedBookIds: user.borrowedBookIds 
      },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;

    // Convert from MongoDB Document to Domain Entity
    return new User(
      doc._id as string,
      doc.name!,
      doc.email!,
      doc.borrowedBookIds as string[]
    );
  }
}
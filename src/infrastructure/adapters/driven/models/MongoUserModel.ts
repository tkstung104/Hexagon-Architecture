import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  borrowedBookIds: [String],
});

export const MongoUserModel = model("User", UserSchema);
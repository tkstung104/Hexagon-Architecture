import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  tier: {
    type: String,
    enum: ["BASIC", "VIP"],
    default: "BASIC",
  },
  numberOfBorrowedBooks: {
    type: Number,
    default: 0,
  },
  newestBorrowedBook: {
    bookId: String,
    title: String,
  },
});

export const MongoUserModel = model("User", UserSchema);
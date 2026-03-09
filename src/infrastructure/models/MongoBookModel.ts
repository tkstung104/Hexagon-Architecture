import { model, Schema } from "mongoose";

const BookSchema = new Schema({
  _id: String,
  title: String,
  author: String,
  isBorrowed: Boolean,
});

export const MongoBookModel = model("Book", BookSchema);
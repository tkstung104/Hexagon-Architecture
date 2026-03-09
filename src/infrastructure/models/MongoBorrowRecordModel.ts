import { model, Schema } from "mongoose";

const BorrowRecordSchema = new Schema({
  _id: String,
  userId: String,
  bookId: String,
  bookTitle: String,
  borrowedAt: Date,
  status: {
    type: String,
    enum: ["ACTIVE", "RETURNED", "OVERDUE"],
    default: "ACTIVE",
  },
  returnedAt: Date,
});

export const MongoBorrowRecordModel = model("BorrowRecord", BorrowRecordSchema);
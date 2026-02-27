import { Schema, model } from "mongoose";
import { Book } from "@entities/Book.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";

// Define Schema for MongoDB
const BookSchema = new Schema({
  _id: String,
  title: String,
  author: String,
  isBorrowed: Boolean,
});

const BookModel = model("Book", BookSchema);

// Implement Adapter
export class MongoBookRepository implements IBookRepository {
  async save(book: Book): Promise<void> {
    await BookModel.findByIdAndUpdate(
      book.id,
      { title: book.title, author: book.author, isBorrowed: book.isBorrowed },
      { upsert: true } // Create if not exists
    );
  }

  async findById(id: string): Promise<Book | null> {
    const doc = await BookModel.findById(id);
    if (!doc) return null;
    // Convert from MongoDB Document to Domain Entity
    return new Book(doc._id as string, doc.title!, doc.author!, doc.isBorrowed!);
  }
}

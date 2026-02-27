import { Schema, model, type ClientSession } from "mongoose";
import { Book } from "@entities/Book.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";

const BookSchema = new Schema({
  _id: String,
  title: String,
  author: String,
  isBorrowed: Boolean,
});

const BookModel = model("Book", BookSchema);

export class MongoBookRepository implements IBookRepository {
  constructor(private readonly session?: ClientSession) {}

  async save(book: Book): Promise<void> {
    await BookModel.findByIdAndUpdate(
      book.id,
      { title: book.title, author: book.author, isBorrowed: book.isBorrowed },
      { upsert: true, ...(this.session ? { session: this.session } : {}) }
    );
  }

  async findById(id: string): Promise<Book | null> {
    const query = BookModel.findById(id);
    if (this.session) query.session(this.session);
    const doc = await query;
    if (!doc) return null;
    return new Book(
      doc._id as string, 
      doc.title!, 
      doc.author!, 
      doc.isBorrowed!);
  }
}

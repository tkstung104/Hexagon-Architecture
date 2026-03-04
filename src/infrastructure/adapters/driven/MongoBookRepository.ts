import { Book } from "@entities/Book.js";
import { type ClientSession } from "mongoose";
import { MongoBookModel } from "@infrastructure/adapters/driven/models/MongoBookModel.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";

export class MongoBookRepository implements IBookRepository {
  constructor(private readonly session?: ClientSession) {}

  async save(book: Book): Promise<void> {
    await MongoBookModel.findByIdAndUpdate(
      book.id,
      { title: book.title, author: book.author, isBorrowed: book.isBorrowed },
      { upsert: true, ...(this.session ? { session: this.session } : {}) }
    );
  }

  async findById(id: string): Promise<Book | null> {
    const query = MongoBookModel.findById(id);
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

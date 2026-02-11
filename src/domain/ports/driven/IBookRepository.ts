import { Book } from "../../entities/Book.js";

export interface IBookRepository {
  save(book: Book): Promise<void>;
  findById(id: string): Promise<Book | null>;
}
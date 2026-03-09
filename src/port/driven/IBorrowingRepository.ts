import { BorrowRecord } from "@entities/BorrowRecord.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";

export interface IBorrowingRepository {
  getBook(bookId: string): Promise<Book | null>;
  getUser(userId: string): Promise<User | null>;
  getActiveRecord(userId: string, bookId: string): Promise<BorrowRecord | null>;
  saveBorrowing(user: User): Promise<void>;
  saveReturning(user: User): Promise<void>;
}
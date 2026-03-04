import type { Book } from "@entities/Book.js";
import type { BorrowRecord } from "@entities/BorrowRecord.js";

export interface ITransaction {
    saveBorrowing(book: Book, record: BorrowRecord): Promise<void>;
    saveReturning(book: Book, record: BorrowRecord): Promise<void>;
}


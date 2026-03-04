import type { ITransaction } from "@port/driven/ITransaction.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";
import type { Book } from "@entities/Book.js";
import type { BorrowRecord } from "@entities/BorrowRecord.js";

export class InMemoryTransaction implements ITransaction {
  constructor(
    private readonly bookRepo: IBookRepository,
    private readonly borrowRecordRepo: IBorrowRecordRepository
  ) {}

  async saveBorrowing(book: Book, record: BorrowRecord): Promise<void> {
    await this.bookRepo.save(book);
    await this.borrowRecordRepo.save(record);
  }

  async saveReturning(book: Book, record: BorrowRecord): Promise<void> {
    await this.bookRepo.save(book);
    await this.borrowRecordRepo.save(record);
  }
}
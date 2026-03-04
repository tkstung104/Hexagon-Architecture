import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IReturnBookUseCase } from "use-cases/IReturnBookUseCase.js";
import type { ITransaction } from "@port/driven/ITransaction.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";
import { DefaultReturnPolicy } from "@entities/policy.js";

export class ReturnBook implements IReturnBookUseCase {
  constructor(
    private readonly bookRepo: IBookRepository,
    private readonly userRepo: IUserRepository,
    private readonly borrowRecordRepo: IBorrowRecordRepository,
    private readonly transaction: ITransaction,
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    const user = await this.userRepo.findById(userId);
    if (!book) throw new Error("Book not found");
    if (!user) throw new Error("User not found");

    const record = await this.borrowRecordRepo.findActiveByUserIdAndBookId(userId, bookId);
    if (!record) throw new Error("Borrow record not found or book is not currently borrowed by this user");
    
    DefaultReturnPolicy.ensureCanReturn(book, record);

    await this.transaction.saveReturning(book, record);
  }
}
import { BorrowRecord } from "@entities/BorrowRecord.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";
import type { ITransaction } from "@port/driven/ITransaction.js";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";
import type { IBorrowBookUseCase } from "use-cases/IBorrowBookUseCase.js";
import { DefaultBorrowPolicy } from "@entities/policy.js";

export class BorrowBook implements IBorrowBookUseCase {
  constructor(
    private readonly bookRepo: IBookRepository,
    private readonly userRepo: IUserRepository,
    private readonly borrowRecordRepo: IBorrowRecordRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly transaction: ITransaction,
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    const user = await this.userRepo.findById(userId);

    if (!book) throw new Error("Book not exist");
    if (!user) throw new Error("User not exist");

    const activeRecords = await this.borrowRecordRepo.findActiveByUserId(userId);

    DefaultBorrowPolicy.ensureCanBorrow(user, book, activeRecords);

    const id = this.idGenerator.generate();
    const record = BorrowRecord.create(id, bookId, userId);

    await this.transaction.saveBorrowing(book, record);
  }
}
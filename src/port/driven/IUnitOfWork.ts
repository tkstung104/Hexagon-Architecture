import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";

// Manage multiple repository operations into a single ACID transaction.
export interface IUnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  get bookRepository(): IBookRepository;
  get userRepository(): IUserRepository;
  get borrowRecordRepository(): IBorrowRecordRepository;
}

import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";

/**
 * In-memory implementation of Unit of Work (no real transaction).
 * Used when MONGO_URI is not set. start/commit/rollback are no-ops.
 */
export class InMemoryUnitOfWork implements IUnitOfWork {
  constructor(
    private readonly _bookRepository: IBookRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _borrowRecordRepository: IBorrowRecordRepository
  ) {}

  async start(): Promise<void> {
    // No-op for in-memory
  }

  async commit(): Promise<void> {
    // No-op for in-memory
  }

  async rollback(): Promise<void> {
    // No-op for in-memory
  }

  get bookRepository(): IBookRepository {
    return this._bookRepository;
  }

  get userRepository(): IUserRepository {
    return this._userRepository;
  }

  get borrowRecordRepository(): IBorrowRecordRepository {
    return this._borrowRecordRepository;
  }
}

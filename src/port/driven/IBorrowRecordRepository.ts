import { BorrowRecord } from "@entities/BorrowRecord.js";

export interface IBorrowRecordRepository {
  save(borrowRecord: BorrowRecord): Promise<void>;
  findActiveByUserId(userId: string): Promise<BorrowRecord[]>;
  findActiveByUserIdAndBookId(userId: string, bookId: string): Promise<BorrowRecord | null>;
}
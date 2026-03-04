import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";

export class InMemoryBorrowRecordRepository implements IBorrowRecordRepository {
  private records: BorrowRecord[] = [];

  async save(record: BorrowRecord): Promise<void> {
    const index = this.records.findIndex((r) => r.id === record.id);
    if (index !== -1) {
      this.records[index] = record;
    } else {
      this.records.push(record);
    }
  }

  async findActiveByUserId(userId: string): Promise<BorrowRecord[]> {
    return this.records.filter(
      (r) => r.userId === userId && r.status === "ACTIVE"
    );
  }

  async findActiveByUserIdAndBookId(userId: string, bookId: string): Promise<BorrowRecord | null> {
    return this.records.find(
      (r) => r.userId === userId && r.bookId === bookId && r.status === "ACTIVE"
    ) ?? null;
  }
}
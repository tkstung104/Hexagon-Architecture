import type { ClientSession } from "mongoose";
import { MongoBorrowRecordModel } from "./models/MongoBorrowRecordModel.js";
import type { IBorrowRecordRepository } from "@port/driven/IBorrowRecordRepository.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";

export class MongoBorrowRecordRepository implements IBorrowRecordRepository {
    constructor(private readonly session?: ClientSession) {}

    async save(record: BorrowRecord): Promise<void> {
      await MongoBorrowRecordModel.findByIdAndUpdate(
        record.id,
        {
          userId: record.userId,
          bookId: record.bookId,
          borrowedAt: record.borrowedAt,
          returnedAt: record.returnedAt,
          status: record.status,
        },
        { upsert: true, ...(this.session ? { session: this.session } : {}) }
      );
    }
    async findActiveByUserIdAndBookId(userId: string, bookId: string): Promise<BorrowRecord | null> {
      const query = MongoBorrowRecordModel.findOne({
        userId,
        bookId,
        status: "ACTIVE",
      });
      if (this.session) query.session(this.session);
      const doc = await query;
      if (!doc) return null;
      return new BorrowRecord(
        doc._id as string,
        doc.bookId as string,
        doc.userId as string,
        doc.borrowedAt as Date,
        doc.status,
        doc.returnedAt ?? null
      );
    }
  
    async findActiveByUserId(userId: string): Promise<BorrowRecord[]> {
      const query = MongoBorrowRecordModel.find({ userId: userId, status: "ACTIVE" });
      if (this.session) query.session(this.session);
      
      const docs = await query;
      
      return docs.map(doc => new BorrowRecord(
        doc._id as string,
        doc.bookId!,
        doc.userId!,
        doc.borrowedAt!,
        doc.status!,
        doc.returnedAt ?? null
      ));
    }
}
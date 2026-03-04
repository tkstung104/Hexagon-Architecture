import mongoose from "mongoose";
import type { ITransaction } from "@port/driven/ITransaction.js";
import type { Book } from "@entities/Book.js";
import type { BorrowRecord } from "@entities/BorrowRecord.js";
import { MongoBorrowRecordRepository } from "./MongoBorrowRecordRepository.js";
import { MongoBookRepository } from "./MongoBookRepository.js";

export class MongoTransaction implements ITransaction {
    async saveBorrowing(book: Book, record: BorrowRecord): Promise<void> {
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const bookRepo = new MongoBookRepository(session);
            const borrowRecordRepo = new MongoBorrowRecordRepository(session);
            await bookRepo.save(book);
            await borrowRecordRepo.save(record);
          });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
          await session.endSession();
        }
    }

    async saveReturning(book: Book,record: BorrowRecord): Promise<void> {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const bookRepo = new MongoBookRepository(session);
                const borrowRecordRepo = new MongoBorrowRecordRepository(session);
                await bookRepo.save(book);
                await borrowRecordRepo.save(record);
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
import mongoose from "mongoose";
import { Book } from "@entities/Book.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";
import { BorrowedBook, User, type UserTier } from "@entities/User.js";
import { MongoBookModel } from "@infrastructure/models/MongoBookModel.js";
import { MongoUserModel } from "@infrastructure/models/MongoUserModel.js";
import { MongoBorrowRecordModel } from "@infrastructure/models/MongoBorrowRecordModel.js";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";

export class MongoBorrowingRepository implements IBorrowingRepository {
    constructor(private readonly idGenerator: IIdGenerator) {}
    
    async getBook(bookId: string): Promise<Book | null> {
      const query = MongoBookModel.findById(bookId);
      const doc = await query;
      if (!doc) return null;
      return new Book(
        doc._id as string, 
        doc.title!, 
        doc.author!, 
        doc.isBorrowed!);
      }
    async getUser(userId: string): Promise<User | null> {
      const query = MongoUserModel.findById(userId);
      const doc = await query;
      if (!doc) return null;
      const borrowedBookRecords = await MongoBorrowRecordModel.find({ userId, status: "ACTIVE" });
      const borrowedBooks = borrowedBookRecords.map((record) => new BorrowedBook(record.bookId!, record.bookTitle!));
      const tier: UserTier = doc.tier === "VIP" ? "VIP" : "BASIC";
      return new User(doc._id as string, doc.name!, doc.email!, doc.numberOfBorrowedBooks!, tier, borrowedBooks);
    }

    async getActiveRecord(userId: string, bookId: string, session?: mongoose.ClientSession): Promise<BorrowRecord | null> {
      const query = MongoBorrowRecordModel.findOne({
        userId,
        bookId,
        status: "ACTIVE",
      });
      if (session) {
        query.session(session);
      }
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

    async saveBorrowing(user: User): Promise<void> {
      const session = await mongoose.startSession();
      try {
        const newBorrowedBooks = user.getNewBorrowedBooks();
        await session.withTransaction(async () => {
          for (const borrowedBook of newBorrowedBooks) {
            await MongoBookModel.findByIdAndUpdate(
              borrowedBook.id, 
              { isBorrowed: true }, 
              { upsert: true, session }
            );
          }

          await MongoUserModel.findByIdAndUpdate(
            user.id, 
            { name: user.name, email: user.email, numberOfBorrowedBooks: user.getNumberOfBorrowedBooks() }, 
            { upsert: true, session }
          );

          for (const borrowedBook of newBorrowedBooks) {
            const newId = await this.idGenerator.generate();
            await MongoBorrowRecordModel.findByIdAndUpdate(
              newId, 
              { userId: user.id, bookId: borrowedBook.id, bookTitle: borrowedBook.title, borrowedAt: new Date()}, 
              { upsert: true, session }
            );
          }
        });
      } catch (error) {
        throw error;
      } finally {
        await session.endSession();
      }
    }

    async saveReturning(user: User): Promise<void> {
      const session = await mongoose.startSession();
      try {
        const bookUserWantToReturn = user.getBookUserWantToReturnBooks();
        await session.withTransaction(async () => {
          for (const book of bookUserWantToReturn) {
            await MongoBookModel.findByIdAndUpdate(
              book.id, 
              { isBorrowed: false }, 
              { session }
            );
          }

          await MongoUserModel.findByIdAndUpdate(
            user.id, 
            { name: user.name, email: user.email, numberOfBorrowedBooks: user.getNumberOfBorrowedBooks() }, 
            { session }
          );

          for (const book of bookUserWantToReturn) {  
            const record = await this.getActiveRecord(user.id, book.id, session);
            if (!record) throw new Error("Borrow record not exist or book is not currently borrowed by this user");
            record.markAsReturned();
            await MongoBorrowRecordModel.findByIdAndUpdate(
              record.id, 
              { status: "RETURNED", returnedAt: new Date()}, 
              { session }
            );
          } 
        });
      } catch (error) {
        throw error;
      } finally {
        await session.endSession();
      }
    }
}


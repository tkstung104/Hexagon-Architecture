import type { ICatalogRepository } from "@port/driven/ICatalogRepository.js";
import { Book } from "@entities/Book.js";
import { User, type UserTier } from "@entities/User.js";
import { MongoBookModel } from "../../infrastructure/models/MongoBookModel.js";
import { MongoUserModel } from "../../infrastructure/models/MongoUserModel.js";

export class MongoCatalogRepository implements ICatalogRepository {
    async saveBook(book: Book): Promise<void> {
        await MongoBookModel.findByIdAndUpdate(
            book.id, 
            { title: book.title, author: book.author, isBorrowed: book.isBorrowed }, 
            { upsert: true });
    }
    async saveUser(user: User): Promise<void> {
        await MongoUserModel.findByIdAndUpdate(
            user.id, 
            { name: user.name, email: user.email, tier: user.getTier(), 
                numberOfBorrowedBooks: user.getNumberOfBorrowedBooks()}, 
            { upsert: true });
    }
    async getBook(bookId: string): Promise<Book | null> {
        const query = MongoBookModel.findById(bookId);
        const doc = await query;
        if (!doc) return null;
        return new Book(doc._id as string, doc.title!, doc.author!, doc.isBorrowed!);
    }
    async getUser(userId: string): Promise<User | null> {
        const query = MongoUserModel.findById(userId);
        const doc = await query;
        if (!doc) return null;
        return new User(doc._id as string, doc.name!, doc.email!, 
            doc.numberOfBorrowedBooks!, doc.tier! as UserTier
        );
    }
}
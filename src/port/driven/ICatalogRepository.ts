import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";

export interface ICatalogRepository {
    saveBook(book: Book): Promise<void>;
    saveUser(user: User): Promise<void>;
    getBook(bookId: string): Promise<Book | null>;
    getUser(userId: string): Promise<User | null>;
}
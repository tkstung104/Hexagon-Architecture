import type { IBookRepository } from "@port/driven/IBookRepository.js";
import { Book } from "@entities/Book.js";

export class InMemoryBookRepository implements IBookRepository {
    private books: Book[] = [];

    async save(book: Book): Promise<void> {
        const index = this.books.findIndex((b) => b.id === book.id);
        if (index !== -1) {
            this.books[index] = book;
        } else {
            this.books.push(book);
        }
    }

    async findById(id: string): Promise<Book | null> {
        return this.books.find((b) => b.id === id) || null;
    }
}

import type { Book } from "./Book.js";

export type UserTier = "BASIC" | "VIP";

const MAX_BORROWED_BY_TIER: Record<UserTier, number> = {
  BASIC: 5,
  VIP: 10,
};


export class BorrowedBook {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public numberOfBorrowedBooks: number = 0,
    private readonly tier: UserTier = "BASIC",
    private borrowedBooks: BorrowedBook[] = [],
    private newBorrowedBooks: BorrowedBook[] = [],
    private bookUserWantToReturn: BorrowedBook[] = [],
  ) {}

  public getTier(): UserTier {
    return this.tier;
  }

  public getMaxBorrowedBooks(): number {
    return MAX_BORROWED_BY_TIER[this.tier];
  }

  public borrowBook(book: Book): void {
    this.borrowedBooks.push(new BorrowedBook(book.id, book.title));
    this.newBorrowedBooks.push(new BorrowedBook(book.id, book.title));
    this.numberOfBorrowedBooks = this.borrowedBooks.length;
  }

  public returnBook(book: Book): void {
    this.bookUserWantToReturn.push(new BorrowedBook(book.id, book.title));
    this.borrowedBooks = this.borrowedBooks.filter(b => b.id !== book.id);
    this.numberOfBorrowedBooks = this.borrowedBooks.length;
  }

  public getNumberOfBorrowedBooks(): number {
    return this.borrowedBooks.length;
  }

  public getNewBorrowedBooks(): BorrowedBook[] {
    return this.newBorrowedBooks;
  }

  public getBookUserWantToReturnBooks(): BorrowedBook[] {
    return this.bookUserWantToReturn;
  }
}
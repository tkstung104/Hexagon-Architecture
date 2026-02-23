export class User {
    constructor(
      public readonly id: string,
      public readonly name: string,
      public readonly email: string,
      public borrowedBookIds: string[] = []
    ) {}
  
    public addBorrowedBook(bookId: string): void {
      this.borrowedBookIds.push(bookId);
    }

    public removeBorrowedBook(bookId: string): void {
      this.borrowedBookIds = this.borrowedBookIds.filter((id) => id !== bookId);
    }

    public getBorrowedBooksCount(): number {
      return this.borrowedBookIds.length;
    }

    public canBorrowMore(): Boolean {
      return this.borrowedBookIds.length < 5;
    }

  }
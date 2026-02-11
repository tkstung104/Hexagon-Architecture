export class Book {
    constructor(
        public readonly id: string,
        public title: string,
        public author: string,
        public isBorrowed: boolean = false
    ) {}
  
    public borrow(): void {
      if (this.isBorrowed) {
        throw new Error("Book is already borrowed!");
      }
      this.isBorrowed = true;
    }
  
    public returnBook(): void {
      this.isBorrowed = false;
    }
  }
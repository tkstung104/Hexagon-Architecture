const PROHIBITED_WORDS = ["banned", "adult"];


export class Book {
    constructor(
        public readonly id: string,
        public title: string,
        public author: string,
        public isBorrowed: boolean = false
    ) {}
  
    public markAsBorrowed(): void {
      this.checkIfCanBeBorrow();
      this.isBorrowed = true;
    }
  
    public markAsReturned(): void {
      // isBorrowed = false
      if (!this.isBorrowed) {
        throw new Error('This book is not being borrowed, therefore can not be returned');
      }
      this.isBorrowed = false;
    }

    private checkIfCanBeBorrow(): void {
      // Book is already borrowed
      if (this.isBorrowed) throw new Error("Book is already borrowed!");

      // Book has been contained prihibited word
      if (PROHIBITED_WORDS.some(word => this.title.toLowerCase().includes(word))) throw new Error ("Book is already banned");
      
      // The author is invalid
      if (!this.author || this.author.toLowerCase() === "unknown") throw new Error ("The author is invalid");
    }
  }

import type { IBorrowBookUseCase } from "use-cases/IBorrowBookUseCase.js";
import { DefaultBorrowPolicy } from "@entities/Policy.js";
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";


export class BorrowBook implements IBorrowBookUseCase {
  constructor(
    private readonly borrowingRepo: IBorrowingRepository,
    private readonly borrowPolicy: DefaultBorrowPolicy = new DefaultBorrowPolicy(),
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const book = await this.borrowingRepo.getBook(bookId);
    const user = await this.borrowingRepo.getUser(userId);

    if (!book) throw new Error("Book not exist");
    if (!user) throw new Error("User not exist");

    // Check if user can borrow more books
    this.borrowPolicy.canThisUserBorrowMoreBooks(user);

    // Action borrow book
    user.borrowBook(book);
    book.markAsBorrowed();

    await this.borrowingRepo.saveBorrowing(user);
  }
}
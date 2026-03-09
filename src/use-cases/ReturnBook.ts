import type { IReturnBookUseCase } from "use-cases/IReturnBookUseCase.js";
import { DefaultReturnPolicy } from "@entities/Policy.js";
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";

export class ReturnBook implements IReturnBookUseCase {
  constructor(
    private readonly borrowingRepo: IBorrowingRepository,
    private readonly returnPolicy: DefaultReturnPolicy = new DefaultReturnPolicy(),
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const book = await this.borrowingRepo.getBook(bookId);
    const user = await this.borrowingRepo.getUser(userId);
    if (!book) throw new Error("Book not exist");
    if (!user) throw new Error("User not exist");

    this.returnPolicy.CanThisUserReturnThisBook(user);

    // Action return book
    user.returnBook(book);
    book.markAsReturned();
    
    await this.borrowingRepo.saveReturning(user);
  }
}
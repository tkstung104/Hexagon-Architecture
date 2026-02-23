import type { IBookRepository } from "../../domain/ports/driven/IBookRepository.js";
import type { IUserRepository } from "../../domain/ports/driven/IUserRepository.js";
import type { IBorrowBookUseCase } from "../../domain/ports/driving/IBorrowBookUseCase.js";

export class BorrowBook implements IBorrowBookUseCase {
  constructor(
    private bookRepo: IBookRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const [user, book] = await Promise.all([
      this.userRepo.findById(userId),
      this.bookRepo.findById(bookId)
    ]);

    if (!user) throw new Error("User not exist");
    if (!book) throw new Error("book not exist");

    // call logic from entity
    book.borrow();
    if (!user.canBorrowMore()) throw new Error("The number of books borrowed is reached the limit of 5");
    user.addBorrowedBook(bookId);

    // Save through Port
    await Promise.all([
      this.bookRepo.save(book),
      this.userRepo.save(user)
    ]);
  }
}
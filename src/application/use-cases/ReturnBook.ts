import type { IBookRepository } from "../../domain/ports/driven/IBookRepository.js";
import type { IUserRepository } from "../../domain/ports/driven/IUserRepository.js";
import type { IReturnBookUseCase } from "../../domain/ports/driving/IReturnBookUseCase.js";

export class ReturnBook implements IReturnBookUseCase {
  constructor(
    private bookRepo: IBookRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const [user, book] = await Promise.all([
      this.userRepo.findById(userId),
      this.bookRepo.findById(bookId)
    ]);

    if (!user) throw new Error("User not found");
    if (!book) throw new Error("Book not found");

    // Call logic from Entity
    book.returnBook();
    user.removeBorrowedBook(bookId);

    // Save through Port
    await Promise.all([
      this.bookRepo.save(book),
      this.userRepo.save(user)
    ]);
  }
}

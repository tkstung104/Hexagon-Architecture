import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IReturnBookUseCase } from "@port/driving/IReturnBookUseCase.js";

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
    // Save through Port - Buffalo cow
    
    // await Promise.all([
    //   this.bookRepo.save(book),
    //   this.userRepo.save(user)
    // ]);

    await this.bookRepo.save(book);

    try {
      // Try to save user
      await this.userRepo.save(user);
    } catch (error) {
      // If save user failed, rollback book
      book.borrow();
      await this.bookRepo.save(book);

      throw new Error("Failed to save user, system will rollback book");
    }
  }
}

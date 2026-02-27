import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IBorrowBookUseCase } from "@port/driving/IBorrowBookUseCase.js";

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
    user.canBorrowMore();
    book.borrow();
    // if (!user.canBorrowMore()) throw new Error("The number of books borrowed is reached the limit of 5");
    user.addBorrowedBook(bookId);

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
      book.returnBook();
      await this.bookRepo.save(book);

      throw new Error("Failed to save user, system will rollback book");
    }
  }
}

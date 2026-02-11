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

    if (!user) throw new Error("User không tồn tại");
    if (!book) throw new Error("Sách không tồn tại");

    // Gọi logic từ Entity
    book.borrow();
    user.addBorrowedBook(bookId);

    // Lưu lại qua Port
    await Promise.all([
      this.bookRepo.save(book),
      this.userRepo.save(user)
    ]);
  }
}
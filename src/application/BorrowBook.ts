import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import type { IUnitOfWorkFactory } from "@port/driven/IUnitOfWorkFactory.js";
import type { IBorrowBookUseCase } from "@port/driving/IBorrowBookUseCase.js";

export class BorrowBook implements IBorrowBookUseCase {
  constructor(private readonly uowFactory: IUnitOfWorkFactory) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const uow: IUnitOfWork = this.uowFactory.create();
    await uow.start();
    try {
      const user = await uow.userRepository.findById(userId);
      const book = await uow.bookRepository.findById(bookId);

      if (!user) throw new Error("User not exist");
      if (!book) throw new Error("book not exist");

      user.canBorrowMore();
      book.borrow();
      user.addBorrowedBook(bookId);

      await uow.bookRepository.save(book);
      await uow.userRepository.save(user);

      await uow.commit();
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
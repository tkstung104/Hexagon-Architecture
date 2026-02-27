import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import type { IUnitOfWorkFactory } from "@port/driven/IUnitOfWorkFactory.js";
import type { IReturnBookUseCase } from "@port/driving/IReturnBookUseCase.js";

export class ReturnBook implements IReturnBookUseCase {
  constructor(private readonly uowFactory: IUnitOfWorkFactory) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const uow: IUnitOfWork = this.uowFactory.create();
    await uow.start();
    try {
      const user = await uow.userRepository.findById(userId);
      const book = await uow.bookRepository.findById(bookId);

      if (!user) throw new Error("User not found");
      if (!book) throw new Error("Book not found");

      book.returnBook();
      user.removeBorrowedBook(bookId);

      await uow.bookRepository.save(book);
      await uow.userRepository.save(user);

      await uow.commit();
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
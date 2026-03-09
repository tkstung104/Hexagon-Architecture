import { ReturnBook } from "./ReturnBook.js";
import { Book } from "@entities/Book.js";
import { BorrowedBook, User } from "@entities/User.js";
import { DefaultReturnPolicy } from "@entities/Policy.js";
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";

describe("ReturnBook use case", () => {
  let borrowingRepo: jest.Mocked<IBorrowingRepository>;
  let returnBookUseCase: ReturnBook;

  beforeEach(() => {
    borrowingRepo = {
      getBook: jest.fn(),
      getUser: jest.fn(),
      getActiveRecord: jest.fn(),
      saveBorrowing: jest.fn(),
      saveReturning: jest.fn(),
    };

    returnBookUseCase = new ReturnBook(borrowingRepo, new DefaultReturnPolicy());
  });

  test("returns a book successfully when book is borrowed and user has the book", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", true);
    const borrowedBooks = [new BorrowedBook(book.id, book.title)];
    const user = new User("U1", "Tung", "tung@com", 1, "BASIC", borrowedBooks);

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await returnBookUseCase.execute(user.id, book.id);

    expect(book.isBorrowed).toBe(false);
    expect(user.getNumberOfBorrowedBooks()).toBe(0);
    expect(borrowingRepo.saveReturning).toHaveBeenCalledTimes(1);

    const [savedUser] = borrowingRepo.saveReturning.mock.calls[0] as [User];
    expect(savedUser).toBe(user);
  });

  test("throws when book does not exist", async () => {
    const user = new User("U1", "Tung", "tung@test.com", 0, "BASIC");

    borrowingRepo.getBook.mockResolvedValue(null);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(returnBookUseCase.execute(user.id, "NON_EXISTENT_BOOK")).rejects.toThrow(
      "Book not exist",
    );

    expect(borrowingRepo.saveReturning).not.toHaveBeenCalled();
  });

  test("throws when user does not exist", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob");

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(null);

    await expect(returnBookUseCase.execute("NON_EXISTENT_USER", book.id)).rejects.toThrow(
      "User not exist",
    );

    expect(borrowingRepo.saveReturning).not.toHaveBeenCalled();
  });

  test("throws when user has zero borrowed books", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", true);
    const user = new User("U1", "Tung", "tung@com", 0, "BASIC");

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(returnBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "The number of books borrowed is 0",
    );

    expect(borrowingRepo.saveReturning).not.toHaveBeenCalled();
  });

  test("throws when book is not borrowed", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", false);
    const borrowedBooks = [new BorrowedBook(book.id, book.title)];
    const user = new User("U1", "Tung", "tung@com", 1, "BASIC", borrowedBooks);

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(returnBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "This book is not being borrowed, therefore can not be returned",
    );

    expect(borrowingRepo.saveReturning).not.toHaveBeenCalled();
  });
});

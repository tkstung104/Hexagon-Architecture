import { BorrowBook } from "./BorrowBook.js";
import { Book } from "@entities/Book.js";
import { BorrowedBook, User } from "@entities/User.js";
import { DefaultBorrowPolicy } from "@entities/Policy.js";
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";

describe("BorrowBook use case", () => {
  let borrowingRepo: jest.Mocked<IBorrowingRepository>;
  let borrowBookUseCase: BorrowBook;

  beforeEach(() => {
    borrowingRepo = {
      getBook: jest.fn(),
      getUser: jest.fn(),
      getActiveRecord: jest.fn(),
      saveBorrowing: jest.fn(),
      saveReturning: jest.fn(),
    };

    borrowBookUseCase = new BorrowBook(borrowingRepo, new DefaultBorrowPolicy());
  });

  test("borrows a book successfully when both user and book exist and user is under limit", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob");
    const user = new User("U1", "Tung", "tung@com", 0, "BASIC");

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await borrowBookUseCase.execute(user.id, book.id);

    expect(book.isBorrowed).toBe(true);
    expect(user.getNumberOfBorrowedBooks()).toBe(1);
    expect(borrowingRepo.saveBorrowing).toHaveBeenCalledTimes(1);

    const [savedUser] = borrowingRepo.saveBorrowing.mock.calls[0] as [User];
    expect(savedUser).toBe(user);
  });

  test("throws when book does not exist", async () => {
    const user = new User("U1", "Tung", "tung@test.com", 0, "BASIC");

    borrowingRepo.getBook.mockResolvedValue(null);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(borrowBookUseCase.execute(user.id, "NON_EXISTENT_BOOK")).rejects.toThrow(
      "Book not exist",
    );

    expect(borrowingRepo.saveBorrowing).not.toHaveBeenCalled();
  });

  test("throws when user does not exist", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob");

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(null);

    await expect(borrowBookUseCase.execute("NON_EXISTENT_USER", book.id)).rejects.toThrow(
      "User not exist",
    );

    expect(borrowingRepo.saveBorrowing).not.toHaveBeenCalled();
  });

  test("throws when user already reached max active borrows", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob");
    const borrowedBooks = Array.from({ length: 10 }, (_, i) => new BorrowedBook(`B${i}`, `Title ${i}`));
    const user = new User("U1", "Tung", "tung@com", 10, "VIP", borrowedBooks);

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(borrowBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "The number of books borrowed is reached the limit of 10",
    );

    expect(borrowingRepo.saveBorrowing).not.toHaveBeenCalled();
  });

  test("throws when book is already borrowed", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", true);
    const user = new User("U1", "Tung", "tung@com", 0, "BASIC");

    borrowingRepo.getBook.mockResolvedValue(book);
    borrowingRepo.getUser.mockResolvedValue(user);

    await expect(borrowBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "Book is already borrowed!",
    );

    expect(borrowingRepo.saveBorrowing).not.toHaveBeenCalled();
  });
});

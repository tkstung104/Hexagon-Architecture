import { BorrowBook } from "./BorrowBook.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";

describe("Unit test: Borrow Book Use Case", () => {
  let mockBookRepo: any;
  let mockUserRepo: any;
  let mockUow: any;
  let mockFactory: any;
  let borrowBookUseCase: BorrowBook;

  beforeEach(() => {
    mockBookRepo = { save: jest.fn(), findById: jest.fn() };
    mockUserRepo = { save: jest.fn(), findById: jest.fn() };
    mockUow = {
      start: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      get bookRepository() {
        return mockBookRepo;
      },
      get userRepository() {
        return mockUserRepo;
      },
    };
    mockFactory = {
      create: jest.fn().mockReturnValue(mockUow),
    };
    borrowBookUseCase = new BorrowBook(mockFactory);
  });

  test("Borrow book successfully when both user and book are validation", async () => {
    const book = new Book("B1", "Hexagonal", "Bob");
    const user = new User("U1", "Tung", "tung@com", []);

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);

    await borrowBookUseCase.execute(user.id, book.id);

    expect(mockUow.start).toHaveBeenCalled();
    expect(book.isBorrowed).toBe(true);
    expect(user.borrowedBookIds).toContain("B1");
    expect(mockBookRepo.save).toHaveBeenCalledWith(book);
    expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    expect(mockUow.commit).toHaveBeenCalled();
    expect(mockUow.rollback).not.toHaveBeenCalled();
  });

  test("Throw error when book not found", async () => {
    const myUser = new User("U1", "Tung", "tung@test.com", []);
    mockBookRepo.findById.mockResolvedValue(null);
    mockUserRepo.findById.mockResolvedValue(myUser);

    await expect(borrowBookUseCase.execute("U1", "NON_EXISTENT_BOOK")).rejects.toThrow(
      "book not exist"
    );

    expect(mockUow.start).toHaveBeenCalled();
    expect(mockUow.rollback).toHaveBeenCalled();
    expect(mockBookRepo.save).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  test("Should throw an error if the user has already borrowed 5 books", async () => {
    const book = new Book("b5", "Hexagon", "Bob");
    const user = new User("u1", "tung", "tung@123", ["b1", "b2", "b3", "b4", "b6"]);

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(borrowBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "The number of books borrowed is reached the limit of 5"
    );

    expect(mockUow.start).toHaveBeenCalled();
    expect(mockUow.rollback).toHaveBeenCalled();
    expect(mockBookRepo.save).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});

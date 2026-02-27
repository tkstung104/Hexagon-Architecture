import { ReturnBook } from "./ReturnBook.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";

describe("Unit test: Return Book Use Case", () => {
  let mockBookRepo: any;
  let mockUserRepo: any;
  let mockUow: any;
  let mockFactory: any;
  let returnBookUseCase: ReturnBook;

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
    returnBookUseCase = new ReturnBook(mockFactory);
  });

  test("Return book successfully", async () => {
    const book = new Book("b1", "Hexa", "Bob", true);
    const user = new User("u1", "Tung", "tung@123", ["b1"]);

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);

    await returnBookUseCase.execute(user.id, book.id);

    expect(mockUow.start).toHaveBeenCalled();
    expect(mockBookRepo.findById).toHaveBeenCalledWith("b1");
    expect(book.isBorrowed).toBe(false);
    expect(user.borrowedBookIds).not.toContain("b1");
    expect(mockBookRepo.save).toHaveBeenCalledWith(book);
    expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    expect(mockUow.commit).toHaveBeenCalled();
    expect(mockUow.rollback).not.toHaveBeenCalled();
  });

  test("Throw error when book not found", async () => {
    const user = new User("U1", "Tung", "tung@123", []);
    mockBookRepo.findById.mockResolvedValue(null);
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(returnBookUseCase.execute("U1", "NON_EXISTENT_BOOK")).rejects.toThrow(
      "Book not found"
    );

    expect(mockUow.start).toHaveBeenCalled();
    expect(mockUow.rollback).toHaveBeenCalled();
    expect(mockBookRepo.save).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
    expect(mockFactory.create).toHaveBeenCalled();
  });
});

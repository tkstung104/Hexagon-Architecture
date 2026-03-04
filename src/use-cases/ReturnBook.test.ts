import { ReturnBook } from "./ReturnBook.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";
// import type { BorrowBook } from "./BorrowBook.js";

describe("Unit test: Return Book Use Case", () => {
  let mockBookRepo: any;
  let mockUserRepo: any;
  let mockBorrowRecordRepo: any;
  let mockTransaction: any;
  let returnBookUseCase: ReturnBook;

  beforeEach(() => {
    mockBookRepo = { save: jest.fn(), findById: jest.fn() };
    mockUserRepo = { save: jest.fn(), findById: jest.fn() };
    mockBorrowRecordRepo = { save: jest.fn(), findActiveByUserId: jest.fn().mockResolvedValue([]), findActiveByUserIdAndBookId: jest.fn().mockResolvedValue(null) };
    mockTransaction = { saveReturning: jest.fn().mockResolvedValue(undefined) };
    returnBookUseCase = new ReturnBook(
      mockBookRepo,
      mockUserRepo,
      mockBorrowRecordRepo,
      mockTransaction
    );
  });

  test("Return book successfully when both user and book exist and book is currently borrowed by the user", async () => {
    const book = new Book("B1", "Hexagonal", "Bob", true);
    const user = new User("U1", "Tung", "tung@com");
    // const record = new BorrowRecord("r1", "B1", "U1", new Date(), "ACTIVE", null);
    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);
    // mockBorrowRecordRepo.findActiveByUserId.mockResolvedValue([new BorrowRecord("r1", "B1", "U1", new Date(), "ACTIVE", null)]);
    
    mockBorrowRecordRepo.findActiveByUserIdAndBookId.mockResolvedValue(new BorrowRecord("r1", "B1", "U1", new Date(), "ACTIVE", null));

    await returnBookUseCase.execute(user.id, book.id);

    expect(book.isBorrowed).toBe(false);
    expect(mockTransaction.saveReturning).toHaveBeenCalledTimes(1);
    const [savedBook, savedRecord] = mockTransaction.saveReturning.mock.calls[0];
    expect(savedBook).toBe(book);
    expect(savedRecord).toBeInstanceOf(BorrowRecord);
    expect(savedRecord.id).toBe("r1");
    expect(savedRecord.bookId).toBe("B1");
    expect(savedRecord.userId).toBe("U1");
    expect(savedRecord.status).toBe("RETURNED");
  });

  test("Throw error when book not found", async () => {
    const myUser = new User("U1", "Tung", "tung@test.com");
    mockBookRepo.findById.mockResolvedValue(null);
    mockUserRepo.findById.mockResolvedValue(myUser);
    mockBorrowRecordRepo.findActiveByUserIdAndBookId.mockResolvedValue(null);

    await expect(returnBookUseCase.execute("U1", "NON_EXISTENT_BOOK")).rejects.toThrow(
      "Book not found"
    );

    expect(mockTransaction.saveReturning).not.toHaveBeenCalled();
  });

  test("Throw error when user not found", async () => {
    const book = new Book("B1", "Hexagon", "Bob");
    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(returnBookUseCase.execute("NON_EXISTENT_USER", "B1")).rejects.toThrow(
      "User not found"
    );

    expect(mockTransaction.saveReturning).not.toHaveBeenCalled();
  });

  test("Should throw an error if the book is not currently borrowed by the user", async () => {
    const book = new Book("b5", "Hexagon", "Bob");
    const user = new User("u1", "tung", "tung@123");

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);
    mockBorrowRecordRepo.findActiveByUserIdAndBookId.mockResolvedValue(null);

    await expect(returnBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "Borrow record not found or book is not currently borrowed by this user"
    );

    expect(mockTransaction.saveReturning).not.toHaveBeenCalled();
  });
});

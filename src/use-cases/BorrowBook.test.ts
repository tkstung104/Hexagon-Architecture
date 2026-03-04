import { BorrowBook } from "./BorrowBook.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";
import { BorrowRecord } from "@entities/BorrowRecord.js";

describe("Unit test: Borrow Book Use Case", () => {
  let mockBookRepo: any;
  let mockUserRepo: any;
  let mockBorrowRecordRepo: any;
  let mockTransaction: any;
  let borrowBookUseCase: BorrowBook;
  let mockIdGenerator: any;

  beforeEach(() => {
    mockBookRepo = { save: jest.fn(), findById: jest.fn() };
    mockUserRepo = { save: jest.fn(), findById: jest.fn() };
    mockBorrowRecordRepo = { save: jest.fn(), findActiveByUserId: jest.fn().mockResolvedValue([]) };
    mockIdGenerator = { generate: jest.fn().mockReturnValue("mock-record-id") };
    mockTransaction = { saveBorrowing: jest.fn().mockResolvedValue(undefined) };
    borrowBookUseCase = new BorrowBook(
      mockBookRepo,
      mockUserRepo,
      mockBorrowRecordRepo,
      mockIdGenerator,
      mockTransaction
    );
  });

  test("Borrow book successfully when both user and book exist and user under limit", async () => {
    const book = new Book("B1", "Hexagonal", "Bob");
    const user = new User("U1", "Tung", "tung@com");

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);
    mockBorrowRecordRepo.findActiveByUserId.mockResolvedValue([]);

    await borrowBookUseCase.execute(user.id, book.id);

    expect(book.isBorrowed).toBe(true);
    expect(mockTransaction.saveBorrowing).toHaveBeenCalledTimes(1);
    const [savedBook, savedRecord] = mockTransaction.saveBorrowing.mock.calls[0];
    expect(savedBook).toBe(book);
    expect(savedRecord).toBeInstanceOf(BorrowRecord);
    expect(savedRecord.id).toBe("mock-record-id");
    expect(savedRecord.bookId).toBe("B1");
    expect(savedRecord.userId).toBe("U1");
    expect(savedRecord.status).toBe("ACTIVE");
  });

  test("Throw error when book not found", async () => {
    const myUser = new User("U1", "Tung", "tung@test.com");
    mockBookRepo.findById.mockResolvedValue(null);
    mockUserRepo.findById.mockResolvedValue(myUser);

    await expect(borrowBookUseCase.execute("U1", "NON_EXISTENT_BOOK")).rejects.toThrow(
      "Book not exist"
    );

    expect(mockTransaction.saveBorrowing).not.toHaveBeenCalled();
  });

  test("Throw error when user not found", async () => {
    const book = new Book("B1", "Hexagon", "Bob");
    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(borrowBookUseCase.execute("NON_EXISTENT_USER", "B1")).rejects.toThrow(
      "User not exist"
    );

    expect(mockTransaction.saveBorrowing).not.toHaveBeenCalled();
  });

  test("Should throw an error if the user has already borrowed 5 books", async () => {
    const book = new Book("b5", "Hexagon", "Bob");
    const user = new User("u1", "tung", "tung@123");
    const fiveRecords = Array.from({ length: 5 }, (_, i) =>
      new BorrowRecord(`r${i}`, `b${i}`, user.id, new Date(), "ACTIVE", null)
    );

    mockBookRepo.findById.mockResolvedValue(book);
    mockUserRepo.findById.mockResolvedValue(user);
    mockBorrowRecordRepo.findActiveByUserId.mockResolvedValue(fiveRecords);

    await expect(borrowBookUseCase.execute(user.id, book.id)).rejects.toThrow(
      "The number of books borrowed is reached the limit of 5"
    );

    expect(mockTransaction.saveBorrowing).not.toHaveBeenCalled();
  });
});

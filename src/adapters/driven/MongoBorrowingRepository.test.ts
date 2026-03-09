import { MongoBookModel } from "@infrastructure/models/MongoBookModel.js";
import { MongoUserModel } from "@infrastructure/models/MongoUserModel.js";
import { MongoBorrowRecordModel } from "@infrastructure/models/MongoBorrowRecordModel.js";
import { MongoBorrowingRepository } from "./MongoBorrowingRepository.js";
import { Book } from "@entities/Book.js";
import { User } from "@entities/User.js";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    startSession: jest.fn(),
  },
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongoose = require("mongoose").default as { startSession: jest.Mock };

jest.mock("@infrastructure/models/MongoBookModel.js", () => ({
  MongoBookModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("@infrastructure/models/MongoUserModel.js", () => ({
  MongoUserModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("@infrastructure/models/MongoBorrowRecordModel.js", () => ({
  MongoBorrowRecordModel: {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe("MongoBorrowingRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mongoose.startSession.mockResolvedValue({
      withTransaction: jest.fn(async (fn: () => Promise<void> | void) => {
        await fn();
      }),
      endSession: jest.fn(),
    });
  });

  const createRepo = (idGeneratorOverrides?: Partial<IIdGenerator>) => {
    const idGenerator: IIdGenerator = {
      generate: jest.fn().mockResolvedValue("RID-1"),
      ...idGeneratorOverrides,
    } as IIdGenerator;

    return { repo: new MongoBorrowingRepository(idGenerator), idGenerator };
  };

  test("getBook returns Book when document exists", async () => {
    const doc = {
      _id: "B1",
      title: "Hexagonal Architecture",
      author: "Bob",
      isBorrowed: true,
    };

    (MongoBookModel.findById as jest.Mock).mockResolvedValue(doc);
    const { repo } = createRepo();

    const result = await repo.getBook("B1");

    expect(MongoBookModel.findById).toHaveBeenCalledWith("B1");
    expect(result).toBeInstanceOf(Book);
    expect(result).toMatchObject({
      id: "B1",
      title: "Hexagonal Architecture",
      author: "Bob",
      isBorrowed: true,
    });
  });

  test("getBook returns null when document does not exist", async () => {
    (MongoBookModel.findById as jest.Mock).mockResolvedValue(null);
    const { repo } = createRepo();

    const result = await repo.getBook("UNKNOWN");

    expect(MongoBookModel.findById).toHaveBeenCalledWith("UNKNOWN");
    expect(result).toBeNull();
  });

  test("getUser returns User with borrowed books when document exists", async () => {
    const userDoc = {
      _id: "U1",
      name: "Tung",
      email: "tung@test.com",
      tier: "VIP",
      numberOfBorrowedBooks: 2,
    };

    const borrowRecords = [
      { bookId: "B1" },
      { bookId: "B2" },
    ];

    (MongoUserModel.findById as jest.Mock).mockResolvedValue(userDoc);
    (MongoBorrowRecordModel.find as jest.Mock).mockResolvedValue(borrowRecords);

    const { repo } = createRepo();

    const result = await repo.getUser("U1");

    expect(MongoUserModel.findById).toHaveBeenCalledWith("U1");
    expect(MongoBorrowRecordModel.find).toHaveBeenCalledWith({
      userId: "U1",
      status: "ACTIVE",
    });
    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(User);
    expect(result?.getTier()).toBe("VIP");
    expect(result?.getNumberOfBorrowedBooks()).toBe(2);
  });

  test("getUser returns null when user document does not exist", async () => {
    (MongoUserModel.findById as jest.Mock).mockResolvedValue(null);

    const { repo } = createRepo();
    const result = await repo.getUser("UNKNOWN");

    expect(MongoUserModel.findById).toHaveBeenCalledWith("UNKNOWN");
    expect(MongoBorrowRecordModel.find).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test("getActiveRecord returns BorrowRecord when record exists", async () => {
    const now = new Date();
    const recordDoc = {
      _id: "R1",
      bookId: "B1",
      userId: "U1",
      borrowedAt: now,
      status: "ACTIVE",
      returnedAt: null,
    };

    (MongoBorrowRecordModel.findOne as jest.Mock).mockResolvedValue(recordDoc);
    const { repo } = createRepo();

    const result = await repo.getActiveRecord("U1", "B1");

    expect(MongoBorrowRecordModel.findOne).toHaveBeenCalledWith({
      userId: "U1",
      bookId: "B1",
      status: "ACTIVE",
    });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("R1");
    expect(result?.bookId).toBe("B1");
    expect(result?.userId).toBe("U1");
  });

  test("getActiveRecord returns null when record does not exist", async () => {
    (MongoBorrowRecordModel.findOne as jest.Mock).mockResolvedValue(null);
    const { repo } = createRepo();

    const result = await repo.getActiveRecord("U1", "B1");

    expect(MongoBorrowRecordModel.findOne).toHaveBeenCalledWith({
      userId: "U1",
      bookId: "B1",
      status: "ACTIVE",
    });
    expect(result).toBeNull();
  });

  test("saveBorrowing persists new borrow: updates books, user and records", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob");
    const user = new User("U1", "Tung", "tung@test.com");
    user.borrowBook(book);

    const { repo, idGenerator } = createRepo();

    await repo.saveBorrowing(user);

    expect(idGenerator.generate).toHaveBeenCalledTimes(1);
    expect(MongoBookModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(MongoUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(MongoBorrowRecordModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);

    const bookUpdateArgs = (MongoBookModel.findByIdAndUpdate as jest.Mock).mock.calls[0];
    expect(bookUpdateArgs[0]).toBe("B1");

    const recordUpdateArgs = (MongoBorrowRecordModel.findByIdAndUpdate as jest.Mock).mock.calls[0];
    expect(recordUpdateArgs[1]).toMatchObject({
      userId: "U1",
      bookId: "B1",
    });
  });

  test("saveReturning throws when there is no active borrow record for this user and book", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", true);
    const user = new User("U1", "Tung", "tung@test.com");
    user.borrowBook(book);
    user.returnBook(book);

    const mockQuery = Promise.resolve(null) as any;
    (mockQuery as any).session = jest.fn().mockReturnValue(mockQuery);
    (MongoBorrowRecordModel.findOne as jest.Mock).mockReturnValue(mockQuery);

    const { repo } = createRepo();

    await expect(repo.saveReturning(user)).rejects.toThrow(
      "Borrow record not exist or book is not currently borrowed by this user",
    );

    expect(MongoBorrowRecordModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("saveReturning updates records when active borrow exists", async () => {
    const book = new Book("B1", "Hexagonal Architecture", "Bob", true);
    const user = new User("U1", "Tung", "tung@test.com");
    user.borrowBook(book);
    user.returnBook(book);

    const now = new Date();
    const recordDoc = {
      _id: "R1",
      bookId: "B1",
      userId: "U1",
      borrowedAt: now,
      status: "ACTIVE",
      returnedAt: null,
    };

    const mockQuery = Promise.resolve(recordDoc) as any;
    (mockQuery as any).session = jest.fn().mockReturnValue(mockQuery);
    (MongoBorrowRecordModel.findOne as jest.Mock).mockReturnValue(mockQuery);

    const { repo } = createRepo();

    await repo.saveReturning(user);

    expect(MongoBookModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(MongoUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(MongoBorrowRecordModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);

    const [recordId, update] = (MongoBorrowRecordModel.findByIdAndUpdate as jest.Mock).mock.calls[0];
    expect(recordId).toBe("R1");
    expect(update).toMatchObject({ status: "RETURNED" });
  });
});


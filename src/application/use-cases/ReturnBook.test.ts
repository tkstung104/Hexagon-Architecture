import { ReturnBook } from "./ReturnBook.js"
import { Book } from "../../domain/entities/Book.js";
import { User } from "../../domain/entities/User.js";

describe("Unit test: Return Book Use Case", () => {
    let mockBookRepo : any;
    let mockUserRepo : any;
    let returnBookUseCase: ReturnBook;

    beforeEach(() => {
        mockBookRepo = {
            save: jest.fn(),
            findById: jest.fn(),
        };

        mockUserRepo = {
            save: jest.fn(),
            findById: jest.fn(),
        }

        returnBookUseCase = new ReturnBook(mockBookRepo,mockUserRepo);
    })

    test("Return book successfully", async () => {
        const book = new Book("b1", "Hexa", "Bob", true);
        const user = new User("u1", "Tung", "tung@123", ["b1"]);

        mockBookRepo.findById.mockResolvedValue(book);
        mockUserRepo.findById.mockResolvedValue(user);

        await returnBookUseCase.execute(user.id, book.id);

        expect(mockBookRepo.findById).toHaveBeenCalledWith("b1");

        expect(book.isBorrowed).toBe(false);
        expect(user.borrowedBookIds).toBeNull;

        expect(mockBookRepo.save).toHaveBeenCalledWith(book);
        expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    });

    test("Throw error when book not found", async () => {
        const user = new User("U1", "Tung", "tung@123", []);

        mockBookRepo.findById.mockResolvedValue(null);
        mockUserRepo.findById.mockResolvedValue(user);

        const returnBookUseCase = new ReturnBook(mockBookRepo, mockUserRepo);
        await expect(returnBookUseCase.execute("U1", "NON_EXISTENT_BOOK"))
            .rejects
            .toThrow("Book not found");

        expect(mockBookRepo.save).not.toHaveBeenCalledWith();
        
        expect(mockUserRepo.save).not.toHaveBeenCalledWith();
    })
})
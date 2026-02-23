import { BorrowBook } from "./BorrowBook.js"
import { Book } from "../../domain/entities/Book.js";
import { User } from "../../domain/entities/User.js";

describe("Unit test: Borrow Book Use Case", () => {
    let mockBookRepo : any;
    let mockUserRepo : any;
    let borrowBookUseCase: BorrowBook;

    beforeEach(() => {
        mockBookRepo = {
            save: jest.fn(),
            findById: jest.fn(),
        }

        mockUserRepo = {
            save: jest.fn(),
            findById: jest.fn(),
        }

        // Intialize new use case
        borrowBookUseCase = new BorrowBook(mockBookRepo,mockUserRepo);
    });

    test("Borrow book successfully when both user and book are validation", async () => {
        
        // Create template for Book and User
        const book = new Book ("B1", "Hexagonal", "Bob");
        const user = new User ("U1", "Tung", "tung@com", []);

        mockBookRepo.findById.mockResolvedValue(book);
        mockUserRepo.findById.mockResolvedValue(user);

        await borrowBookUseCase.execute(user.id,book.id);

        expect(book.isBorrowed).toBe(true);
        expect(user.borrowedBookIds).toContain("B1");

        expect(mockBookRepo.save).toHaveBeenCalledWith(book);
        expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    });

    test("Throw error when book not found", async () => {
        // --- 1. ARRANGE ---
        // Giả lập User tồn tại
        const myUser = new User("U1", "Tung", "tung@test.com", []);
    
        mockBookRepo.findById.mockResolvedValue(null);
        mockUserRepo.findById.mockResolvedValue(myUser);

        // --- 2. ACT & ASSERT ---
        // Kiểm tra xem Use Case có ném ra đúng lỗi mà mình đã viết trong code nghiệp vụ không
        await expect(borrowBookUseCase.execute("U1", "NON_EXISTENT_BOOK"))
            .rejects
            .toThrow("book not exist");
    
        // Kiểm tra thêm: Nếu sách không tồn tại thì KHÔNG được gọi lệnh save của cả Book và User
        expect(mockBookRepo.save).not.toHaveBeenCalled();
        expect(mockUserRepo.save).not.toHaveBeenCalled();
        
    });

    // Test case 3: check the logic of limiting the number of books a user can borrow
    test("Should throw an error if the user has already borrowed 5 books", async ()  => {
        const book = new Book("b5", "Hexagon", "Bob");
        const user = new User("u1", "tung", "tung@123", ["b1", "b2", "b3","b4", "b6"]);

        mockBookRepo.findById.mockResolvedValue(book);
        mockUserRepo.findById.mockResolvedValue(user);

        await expect(borrowBookUseCase.execute(user.id, book.id))
        .rejects
        .toThrow("The number of books borrowed is reached the limit of 5");

        expect(mockBookRepo.save).not.toHaveBeenCalled();
        expect(mockUserRepo.save).not.toHaveBeenCalled();
    })
});
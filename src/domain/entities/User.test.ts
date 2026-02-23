import { User } from "./User.js"

describe("User entity", () => {
    test("User is borrowing less than 5 books", () => {
        // Arrange
        const user = new User("U1","Tung","tung@com", ["b1","b2"]);

        // Act
        const check = user.canBorrowMore();

        // Assert
        expect(check).toBe(true);

    })

    test("Borrowed more than 5 books",() => {
        const user = new User("U1","Tung","tung@com",["b1","b2","b3","b4","b5","b6"])
    
        const check = user.canBorrowMore();

        expect(check).toBe(false)
    });
});
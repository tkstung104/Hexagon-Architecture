import { User } from "./User.js"

describe("User entity", () => {
    test("User is borrowing less than 5 books", () => {
        // Arrange
        const user = new User("U1","Tung","tung@com", ["b1","b2"]);

        // Act
        expect(() => {
            user.canBorrowMore();
        }).not.toThrow();
    })

    test("Borrowed more than 5 books",() => {
        const user = new User("U1","Tung","tung@com",["b1","b2","b3","b4","b5","b6"])
    
        expect(() => {
            user.canBorrowMore();
        }).toThrow("The number of books borrowed is reached the limit of 5");
    });
});

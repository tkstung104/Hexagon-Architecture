import { Book } from "./Book.js";

describe("Unit test: Book Entity", () => {
  
  // Test case 1: Check the initial state of the book
  test("New book should be in the default state of not borrowed", () => {
    // Arrange
    const book = new Book("B1", "Clean Architecture", "Uncle Bob");

    // Assert
    expect(book.isBorrowed).toBe(false);
  });

  // Test case 2: Check the logic of borrowing a book successfully
  test("When calling borrow(), the isBorrowed state should be changed to true", () => {
    // Arrange
    const book = new Book("B1", "Clean Architecture", "Uncle Bob");

    // Act
    book.borrow();

    // Assert
    expect(book.isBorrowed).toBe(true);
  });

  // Test case 3: Check the logic of blocking borrowing a book twice 
  test("Should throw an error if borrowing a book that has already been borrowed", () => {
    // Arrange
    const book = new Book("B1", "Clean Architecture", "Uncle Bob");
    book.borrow(); // Borrow successfully

    // Act & Assert
    // To test if a function throws an error, wrap it in an anonymous function
    expect(() => {
      book.borrow(); // Borrow again
    }).toThrow("Book is already borrowed!");
  });

  // Test case 4: Check the logic of blocking borrowing a book that contain prohibit word
  test("Should throw an error if borrowing a book that contain prohibit word", () =>{
    // Arrage
    const book = new Book ("b1", "adult book", "Bob");
    
    expect(() => {
      book.borrow();
    }).toThrow("Book is already banned");
  })
  // Test case 5: Check the logic of blocking borrowing a book that the author is unknown
  test("Should throw an error if the author is unknown", () => {
    const book = new Book ("b1", "Book","Unknown");

    expect(() => {
      book.borrow();
    }).toThrow("The author is invalid")

  })
});

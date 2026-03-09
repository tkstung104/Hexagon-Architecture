import { Book } from "./Book.js";

describe("Book entity", () => {
  test("new book is not borrowed by default", () => {
    const book = new Book("B1", "Clean Architecture", "Robert Martin");

    expect(book.isBorrowed).toBe(false);
  });

  test("markAsBorrowed marks book as borrowed when allowed", () => {
    const book = new Book("B1", "Clean Architecture", "Robert Martin");

    book.markAsBorrowed();

    expect(book.isBorrowed).toBe(true);
  });

  test("markAsBorrowed throws when book is already borrowed", () => {
    const book = new Book("B1", "Clean Architecture", "Robert Martin");
    book.markAsBorrowed();

    expect(() => book.markAsBorrowed()).toThrow("Book is already borrowed!");
  });

  test("markAsBorrowed throws when title contains prohibited word", () => {
    const book = new Book("B1", "adult book", "Robert Martin");

    expect(() => book.markAsBorrowed()).toThrow("Book is already banned");
  });

  test("markAsBorrowed throws when author is unknown", () => {
    const book = new Book("B1", "Some book", "Unknown");

    expect(() => book.markAsBorrowed()).toThrow("The author is invalid");
  });

  test("markAsReturned marks book as not borrowed when it was borrowed", () => {
    const book = new Book("B1", "Clean Architecture", "Robert Martin");
    book.markAsBorrowed();

    book.markAsReturned();

    expect(book.isBorrowed).toBe(false);
  });

  test("markAsReturned throws when book is not currently borrowed", () => {
    const book = new Book("B1", "Clean Architecture", "Robert Martin");

    expect(() => book.markAsReturned()).toThrow(
      "This book is not being borrowed, therefore can not be returned",
    );
  });
});

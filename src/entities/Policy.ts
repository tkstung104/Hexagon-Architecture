import type { Book } from "./Book.js";
import { BorrowRecord } from "./BorrowRecord.js";
import type { User } from "./User.js";


export class DefaultBorrowPolicy {
    canThisUserBorrowMoreBooks(user: User): void {
        const numberOfRecords = user.getNumberOfBorrowedBooks();
        if (numberOfRecords >= user.getMaxBorrowedBooks()) {
            throw new Error(`The number of books borrowed is reached the limit of ${user.getMaxBorrowedBooks()}`);
        }
    }
}

export class DefaultReturnPolicy {
    CanThisUserReturnThisBook(user: User): void {
        const numberOfRecords = user.getNumberOfBorrowedBooks();
        if (numberOfRecords <= 0) {
            throw new Error(`The number of books borrowed is 0`);
        }
    }
}
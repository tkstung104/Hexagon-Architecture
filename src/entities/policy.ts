import type { Book } from "./Book.js";
import type { BorrowRecord } from "./BorrowRecord.js";
import type { User } from "./User.js";


export class DefaultBorrowPolicy {
    private static readonly MAX_ACTIVE_BORROWS = 5;

    static ensureCanBorrow(user: User, book: Book, activeRecords: BorrowRecord[]): void {
        if (activeRecords.length >= this.MAX_ACTIVE_BORROWS) {
            throw new Error("The number of books borrowed is reached the limit of 5");
          }     
          book.borrow();
    }
}

export class DefaultReturnPolicy {
    static ensureCanReturn(book: Book, record: BorrowRecord): void {
        if (record.status !== "ACTIVE") {
            throw new Error("Borrow record is currently not active");
        }
        book.returnBook();
        record.markAsReturned();
    }
}
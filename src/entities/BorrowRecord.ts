import type { Book } from "@entities/Book.js";

export const MAX_ACTIVE_BORROWS = 5;

export type BorrowStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

export class BorrowRecord {
    constructor(
        public readonly id: string,
        public readonly bookId: string,
        public readonly userId: string,
        public readonly borrowedAt: Date = new Date(), 
        public status: BorrowStatus = "ACTIVE",
        public returnedAt: Date | null = null 
    ) {}
    
    static create(id: string, bookId: string, userId: string): BorrowRecord {
        return new BorrowRecord(id, bookId, userId, new Date(), "ACTIVE", null);
    }
    
    markAsReturned(): void {
        if (this.status === "RETURNED") throw new Error("Borrow record already returned");
        this.status = "RETURNED";
        this.returnedAt = new Date();
    }
    
    public getStatus(): string {
        return this.status;
    }
}
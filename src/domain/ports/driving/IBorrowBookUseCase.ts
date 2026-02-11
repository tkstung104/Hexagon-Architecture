export interface IBorrowBookUseCase {
    execute(userId: string, bookId: string): Promise<void>;
}
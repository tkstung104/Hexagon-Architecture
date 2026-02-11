export interface IReturnBookUseCase {
    execute(userId: string, bookId: string): Promise<void>;
}
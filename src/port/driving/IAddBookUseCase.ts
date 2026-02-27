export interface IAddBookUseCase {
  execute(id: string, title: string, author: string): Promise<void>;
}

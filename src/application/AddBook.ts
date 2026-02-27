import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IAddBookUseCase } from "@port/driving/IAddBookUseCase.js";
import { Book } from "@entities/Book.js";

export class AddBook implements IAddBookUseCase {
  constructor(private bookRepo: IBookRepository) {}

  async execute(id: string, title: string, author: string): Promise<void> {
    const book = new Book(id.trim(), title.trim(), author.trim(), false);
    await this.bookRepo.save(book);
  }
}

import type { IBookRepository } from "../../domain/ports/driven/IBookRepository.js";
import type { IAddBookUseCase } from "../../domain/ports/driving/IAddBookUseCase.js";
import { Book } from "../../domain/entities/Book.js";

export class AddBook implements IAddBookUseCase {
  constructor(private bookRepo: IBookRepository) {}

  async execute(id: string, title: string, author: string): Promise<void> {
    const book = new Book(id.trim(), title.trim(), author.trim(), false);
    await this.bookRepo.save(book);
  }
}

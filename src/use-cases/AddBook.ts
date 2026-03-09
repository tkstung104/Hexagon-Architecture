import type { IAddBookUseCase } from "use-cases/IAddBookUseCase.js";
import { Book } from "@entities/Book.js";
import type { ICatalogRepository } from "@port/driven/ICatalogRepository.js";

export class AddBook implements IAddBookUseCase {
  constructor(private catalogRepo: ICatalogRepository) {}

  async execute(id: string, title: string, author: string): Promise<void> {
    const book = new Book(id, title, author, false);
    await this.catalogRepo.saveBook(book);
  }
}

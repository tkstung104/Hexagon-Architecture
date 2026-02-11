import type { Request, Response } from "express";
import type { IBorrowBookUseCase } from "../../../domain/ports/driving/IBorrowBookUseCase.js";
import type { IAddBookUseCase } from "../../../domain/ports/driving/IAddBookUseCase.js";
import type { IBookRepository } from "../../../domain/ports/driven/IBookRepository.js";
import type { IReturnBookUseCase } from "../../../domain/ports/driving/IReturnBookUseCase.js";

export class BookController {
  constructor(
    private borrowBookUseCase: IBorrowBookUseCase,
    private returnBookUseCase: IReturnBookUseCase,
    private addBookUseCase: IAddBookUseCase,
    private bookRepo: IBookRepository
  ) {}

  async borrow(req: Request, res: Response) {
    const { userId, bookId } = req.body;
    try {
      await this.borrowBookUseCase.execute(userId, bookId);
      res.status(200).json({ message: "Borrow book successfully!" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async returnBook(req: Request, res: Response) {
    const { userId, bookId } = req.body;
    try {
      await this.returnBookUseCase.execute(userId, bookId);
      res.status(200).json({ message: "Return book successfully!" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addBook(req: Request, res: Response) {
    const { id, title, author } = req.body;
    if (!id || !title || !author) {
      res.status(400).json({ error: "Missing id, title or author." });
      return;
    }
    try {
      await this.addBookUseCase.execute(id, title, author);
      res.status(201).json({ message: "Add book successfully!", id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({ error: "Missing id." });
      return;
    }
    try {
      const book = await this.bookRepo.findById(id);
      if (!book) {
        res.status(404).json({ error: "Book not found." });
        return;
      }
      res.status(200).json({
        id: book.id,
        title: book.title,
        author: book.author,
        isBorrowed: book.isBorrowed,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
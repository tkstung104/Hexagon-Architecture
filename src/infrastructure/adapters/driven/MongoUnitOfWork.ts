import mongoose from "mongoose";
import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import { MongoBookRepository } from "@infrastructure/adapters/driven/MongoBookRepository.js";
import { MongoUserRepository } from "@infrastructure/adapters/driven/MongoUserRepository.js";

export class MongoUnitOfWork implements IUnitOfWork {
  private session: mongoose.ClientSession | null = null;
  private _bookRepository: MongoBookRepository | null = null;
  private _userRepository: MongoUserRepository | null = null;

  async start(): Promise<void> {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
    this._bookRepository = new MongoBookRepository(this.session);
    this._userRepository = new MongoUserRepository(this.session);
  }

  async commit(): Promise<void> {
    if (!this.session) throw new Error("Unit of Work not started");
    try {
      await this.session.commitTransaction();
    } finally {
      await this.session.endSession();
      this.session = null;
      this._bookRepository = null;
      this._userRepository = null;
    }
  }

  async rollback(): Promise<void> {
    // If there is no active session, there is nothing to rollback.
    // This can happen when commit() already closed the session
    // but the caller still invokes rollback() from a catch block.
    if (!this.session) return;
    try {
      await this.session.abortTransaction();
    } finally {
      await this.session.endSession();
      this.session = null;
      this._bookRepository = null;
      this._userRepository = null;
    }
  }

  get bookRepository(): MongoBookRepository {
    if (!this._bookRepository) throw new Error("Unit of Work not started");
    return this._bookRepository;
  }

  get userRepository(): MongoUserRepository {
    if (!this._userRepository) throw new Error("Unit of Work not started");
    return this._userRepository;
  }
}

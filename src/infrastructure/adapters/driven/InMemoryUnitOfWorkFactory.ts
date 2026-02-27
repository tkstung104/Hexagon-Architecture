import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import type { IUnitOfWorkFactory } from "@port/driven/IUnitOfWorkFactory.js";
import type { IBookRepository } from "@port/driven/IBookRepository.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";
import { InMemoryUnitOfWork } from "@infrastructure/adapters/driven/InMemoryUnitOfWork.js";

export class InMemoryUnitOfWorkFactory implements IUnitOfWorkFactory {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository
  ) {}

  create(): IUnitOfWork {
    return new InMemoryUnitOfWork(this.bookRepository, this.userRepository);
  }
}
import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";
import type { IUnitOfWorkFactory } from "@port/driven/IUnitOfWorkFactory.js";
import { MongoUnitOfWork } from "@infrastructure/adapters/driven/MongoUnitOfWork.js";

export class MongoUnitOfWorkFactory implements IUnitOfWorkFactory {
  create(): IUnitOfWork {
    return new MongoUnitOfWork();
  }
}
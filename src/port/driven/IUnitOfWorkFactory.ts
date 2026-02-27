import type { IUnitOfWork } from "@port/driven/IUnitOfWork.js";

// Factory for creating Unit of Work instances.
// When 2 transactions are action at the same time, we need to create a new Unit of Work instance.
// To avoid the risk of data inconsistency if one of the two save operations to MongoDB fails.
export interface IUnitOfWorkFactory {
  create(): IUnitOfWork;
}
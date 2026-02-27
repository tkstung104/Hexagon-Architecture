Act as a Backend Node.js and TypeScript expert with a deep understanding of Hexagonal Architecture (Ports and Adapters).

I have a project that manages book-borrowing business logic. Currently, in Use Cases such as `BorrowBook` and `ReturnBook`, I am calling the `.save()` methods of `IBookRepository` and `IUserRepository` independently. This creates a risk of data inconsistency if one of the two save operations to MongoDB fails.

Your task is to refactor the code to ensure data integrity.

**Core constraints and principles (MUST be followed):**
1. DO NOT merge User and Book data into a single Collection. Keep Entities and Collections completely separate.
2. Apply the **Unit of Work (UoW)** pattern combined with **Multi-Document ACID Transactions** in MongoDB (via `mongoose.ClientSession`).
3. Strictly follow the Dependency Rule of Hexagonal Architecture: The Core layer (Domain/Application) must NOT contain any Mongoose code or types (such as `ClientSession`). The Core layer communicates only through interfaces.

**Please refactor according to the following steps and provide detailed code for each file:**

* **Step 1: Define the Port for UoW (Domain layer)**
    Create a new file `src/port/driven/IUnitOfWork.ts`. This interface must define `start()`, `commit()`, `rollback()` and getters that return instances of `IBookRepository` and `IUserRepository` bound to the transaction.

* **Step 2: Modify Application Use Cases (Application layer)**
    Update the file `src/application/BorrowBook.ts` (and similarly for `ReturnBook.ts`). Instead of injecting `IBookRepository` and `IUserRepository` into the constructor, inject `IUnitOfWork`.
    Use a `try...catch` block to:
    - Call `uow.start()`
    - Perform logic to load data and change entity state.
    - Call `.save()` through the repositories provided by the UoW.
    - If everything succeeds, call `uow.commit()`. If an error is caught, call `uow.rollback()` and rethrow the error.

* **Step 3: Implement Mongoose UoW and Repository (Infrastructure layer)**
    - Update `MongoBookRepository` and `MongoUserRepository`: Add the ability to accept a transaction context (here, Mongoose `ClientSession`) so that it can be attached to read/write operations (e.g. `.findById(id).session(session)` or pass `{ session }` into update functions).
    - Create a new file `src/infrastructure/adapters/driven/MongoUnitOfWork.ts` that implements `IUnitOfWork`. This class will contain the logic to call `mongoose.startSession()`, `session.startTransaction()`, `session.commitTransaction()`, and to pass this session down to the Mongo Repositories.

* **Step 4: Update Dependency Injection (Outer layer)**
    Update `src/index.ts` to instantiate `MongoUnitOfWork` and inject it into the `BorrowBook` and `ReturnBook` Use Cases.

Provide code only for files that need to be added or changed. After providing the code, give a brief explanation (in Vietnamese) of the Unit of Work flow from when the Controller calls the Use Case until MongoDB commits the transaction.

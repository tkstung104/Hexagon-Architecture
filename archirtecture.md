# Project Architecture

Based on the folder structure and repository name, this project follows **Hexagonal Architecture** (also known as Ports and Adapters) combined with Domain-Driven Design (DDD).

Here is a short breakdown of the layers from the inside out:

1. **Domain Layer (`src/entities`)**
   Core business objects, data structures, and pure business rules (e.g., `Book`, `User`, `Policy`). This layer has zero external dependencies.

2. **Application Layer (`src/use-cases`)**
   Contains the business application logic and orchestrates the domain entities (e.g., `AddBook`, `BorrowBook`, `ReturnBook`).

3. **Ports Layer (`src/port`)**
   - **Driven Ports (`src/port/driven`)**: Interfaces defining the contracts for outbound dependencies that the application needs to function (e.g., Repositories, external APIs).

4. **Adapters & Infrastructure Layer (`src/adapters`, `src/infrastructure`)**
   - **Driving Adapters (`src/adapters/driving`)**: The entry points that interact with the application (e.g., REST Controllers like `UserController`, GraphQL, or CLI).
   - **Driven Adapters (`src/adapters/driven`)**: The concrete implementations of the Driven Ports (e.g., MongoDB implementations, in-memory databases, transaction managers).
   - **Infrastructure (`src/infrastructure/models`)**: Low-level database schemas, ORM models (e.g., Mongoose models), and framework-specific setups.

**Flow of dependencies:** Everything points *inward*. Adapters depend on Ports, Use Cases depend on Entities. Entities depend on nothing.

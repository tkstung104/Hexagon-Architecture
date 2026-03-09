import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Adapters
import { BookController } from "adapters/driving/BookController.js";
import { UserController } from "adapters/driving/UserController.js";
import { MongoBorrowingRepository } from "adapters/driven/MongoBorrowingRepository.js";
import { MongoCatalogRepository } from "adapters/driven/MongoCatalogRepository.js";
import { UuidIdGenerator } from "adapters/driven/UuidIdGenerator.js";

// Use Cases  
import { BorrowBook } from "@use-cases/BorrowBook.js";
import { ReturnBook } from "@use-cases/ReturnBook.js";
import { AddBook } from "@use-cases/AddBook.js";
import { AddUser } from "@use-cases/AddUser.js";

// Ports
import type { IBorrowingRepository } from "@port/driven/IBorrowingRepository.js";
import type { ICatalogRepository } from "@port/driven/ICatalogRepository.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function bootstrap() {
  try {
    const uri = process.env.MONGO_URI || "";
    const idGenerator = new UuidIdGenerator();

    let catalogRepo: ICatalogRepository;
    let borrowingRepo: IBorrowingRepository;

    if (!uri) {
      console.log("Running with InMemory (no MongoDB). Set USE_MEMORY=true or leave MONGO_URI empty.");
    } else {
      await mongoose.connect(uri, { autoSelectFamily: false });
      console.log("Successfully connected to MongoDB Atlas!");
      catalogRepo = new MongoCatalogRepository();
      borrowingRepo = new MongoBorrowingRepository(idGenerator);
    

      const borrowBookUseCase = new BorrowBook(borrowingRepo);
      const returnBookUseCase = new ReturnBook(borrowingRepo);
      const addBookUseCase = new AddBook(catalogRepo);
      const addUserUseCase = new AddUser(catalogRepo);

      const bookController = new BookController(
        borrowBookUseCase,
        returnBookUseCase,
        addBookUseCase,
        catalogRepo
      );
      const userController = new UserController(addUserUseCase, catalogRepo);

      app.post("/borrow", (req, res) => bookController.borrow(req, res));
      app.post("/return", (req, res) => bookController.returnBook(req, res));
      app.post("/books", (req, res) => bookController.addBook(req, res));
      app.get("/books/:id", (req, res) => bookController.getById(req, res));
      app.post("/users", (req, res) => userController.addUser(req, res));
      app.get("/users/:id", (req, res) => userController.getById(req, res));

      app.use(express.static("frontend"));

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Error starting system:", error);
    process.exit(1);
  }
}

bootstrap();
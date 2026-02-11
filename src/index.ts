import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import Adapters
import { MongoBookRepository } from "./infrastructure/adapters/driven/MongoBookRepository.js";
import { MongoUserRepository } from "./infrastructure/adapters/driven/MongoUserRepository.js";
import { InMemoryBookRepository } from "./infrastructure/adapters/driven/InMemoryBookRepository.js";
import { InMemoryUserRepository } from "./infrastructure/adapters/driven/InMemoryUserRepository.js";
import { BookController } from "./infrastructure/adapters/driving/BookController.js";
import { UserController } from "./infrastructure/adapters/driving/UserController.js";

// Import Interators
import { BorrowBook } from "./application/use-cases/BorrowBook.js";
import { ReturnBook } from "./application/use-cases/ReturnBook.js";
import { AddBook } from "./application/use-cases/AddBook.js";
import { AddUser } from "./application/use-cases/AddUser.js";

// Import Core & Ports
import type { IBookRepository } from "./domain/ports/driven/IBookRepository.js";
import type { IUserRepository } from "./domain/ports/driven/IUserRepository.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function bootstrap() {
  try {
    const uri = process.env.MONGO_URI || "";

    let bookRepo: IBookRepository;
    let userRepo: IUserRepository;

    if (!uri) {
      console.log("Running with InMemory (no MongoDB). Set USE_MEMORY=true or leave MONGO_URI empty.");
      bookRepo = new InMemoryBookRepository();
      userRepo = new InMemoryUserRepository();
    } else {
      await mongoose.connect(uri, { autoSelectFamily: false });
      console.log("Successfully connected to MongoDB Atlas!");
      bookRepo = new MongoBookRepository();
      userRepo = new MongoUserRepository();
    }

    // Initialize Use Cases
    const borrowBookUseCase = new BorrowBook(bookRepo, userRepo);
    const returnBookUseCase = new ReturnBook(bookRepo, userRepo);
    const addBookUseCase = new AddBook(bookRepo);
    const addUserUseCase = new AddUser(userRepo);

    // Initialize Controllers
    const bookController = new BookController(borrowBookUseCase, returnBookUseCase, addBookUseCase, bookRepo);
    const userController = new UserController(addUserUseCase, userRepo);

    // Routes API
    app.post("/borrow", (req, res) => bookController.borrow(req, res));
    app.post("/return", (req, res) => bookController.returnBook(req, res));
    app.post("/books", (req, res) => bookController.addBook(req, res));
    app.get("/books/:id", (req, res) => bookController.getById(req, res));
    app.post("/users", (req, res) => userController.addUser(req, res));
    app.get("/users/:id", (req, res) => userController.getById(req, res));

    //Serve frontend (open http://localhost:3000 to use the interface)
    app.use(express.static("frontend"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
    
  } catch (error) {
    console.error("Error starting system:", error);
    process.exit(1);
  }
}

bootstrap();
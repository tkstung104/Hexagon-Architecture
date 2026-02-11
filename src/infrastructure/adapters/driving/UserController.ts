import type { Request, Response } from "express";
import type { IAddUserUseCase } from "../../../domain/ports/driving/IAddUserUseCase.js";
import type { IUserRepository } from "../../../domain/ports/driven/IUserRepository.js";

export class UserController {
  constructor(
    private addUserUseCase: IAddUserUseCase,
    private userRepo: IUserRepository
  ) {}

  async addUser(req: Request, res: Response) {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      res.status(400).json({ error: "Missing id, name or email." });
      return;
    }
    try {
      await this.addUserUseCase.execute(id, name, email);
      res.status(201).json({ message: "Add user successfully!", id });
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
      const user = await this.userRepo.findById(id);
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        borrowedBookIds: user.borrowedBookIds,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

import type { IUserRepository } from "@port/driven/IUserRepository.js";
import type { IAddUserUseCase } from "use-cases/IAddUserUseCase.js";
import { User } from "@entities/User.js";

export class AddUser implements IAddUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string, name: string, email: string): Promise<void> {
    const user = new User(id, name, email);
    await this.userRepo.save(user);
  }
}

import type { IUserRepository } from "../../domain/ports/driven/IUserRepository.js";
import type { IAddUserUseCase } from "../../domain/ports/driving/IAddUserUseCase.js";
import { User } from "../../domain/entities/User.js";

export class AddUser implements IAddUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string, name: string, email: string): Promise<void> {
    const user = new User(id.trim(), name.trim(), email.trim(), []);
    await this.userRepo.save(user);
  }
}

import type { ICatalogRepository } from "@port/driven/ICatalogRepository.js";
import type { IAddUserUseCase } from "use-cases/IAddUserUseCase.js";
import { User } from "@entities/User.js";

export class AddUser implements IAddUserUseCase {
  constructor(private catalogRepo: ICatalogRepository) {}

  async execute(id: string, name: string, email: string): Promise<void> {
    const user = new User(id, name, email);
    await this.catalogRepo.saveUser(user);
  }
}

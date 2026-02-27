import { User } from "@entities/User.js";
import type { IUserRepository } from "@port/driven/IUserRepository.js";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }
}

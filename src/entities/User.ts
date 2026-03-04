export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}

  public updateProfile(newName: string, newEmail: string): void {
    if (!newName.trim() || !newEmail.trim()) {
      throw new Error("Name and email cannot be empty");
    }
    this.name = newName;
    this.email = newEmail;
  }
}
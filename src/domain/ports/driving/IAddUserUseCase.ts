export interface IAddUserUseCase {
  execute(id: string, name: string, email: string): Promise<void>;
}

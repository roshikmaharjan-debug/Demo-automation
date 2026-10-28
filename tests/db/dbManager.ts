import { UserRepository } from "./repositories/userRepository";

export class DbManager {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
}

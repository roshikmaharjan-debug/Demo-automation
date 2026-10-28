import { UserRepository } from "./repositories/userRepository";
import { SqlExecutor } from "./sqlExecutor";

export class DbManager {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(new SqlExecutor());
  }
}

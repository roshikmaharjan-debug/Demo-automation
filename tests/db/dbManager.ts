import { UserRepository } from "./repositories/userRepository";
import { SqlExecutor } from "./sqlExecutor";

export class DbManager {
  userRepository: UserRepository;

  constructor() {
    const executor = new SqlExecutor();
    this.userRepository = new UserRepository(executor);
  }
}

import { SqlExecutor } from "../sqlExecutor";
import { USER_QUERIES } from "../queries/userSqlScripts";

export interface UserRow {
  username: string;
  password: string;
  expected_type: "inventory" | "error";
  expected_message: string | null;
}

export interface LoginResultRow {
  id: number;
  username: string;
  outcome: string;
  ran_at: string;
}

export class UserRepository {
  executor: SqlExecutor;

  constructor() {
    this.executor = new SqlExecutor();
  }

  public getAll(): UserRow[] {
    return this.executor.all<UserRow>(USER_QUERIES.GET_ALL);
  }

  public findByUsername(username: string): UserRow | undefined {
    const rows = this.executor.all<UserRow>(USER_QUERIES.FIND_BY_USERNAME, [
      username,
    ]);
    return rows[0];
  }

  public insertLoginResult(
    username: string,
    outcome: string,
    ranAt: string,
  ): void {
    this.executor.run(USER_QUERIES.INSERT_LOGIN_RESULT, [
      username,
      outcome,
      ranAt,
    ]);
  }

  public findLoginResultsByUsername(username: string): LoginResultRow[] {
    return this.executor.all<LoginResultRow>(
      USER_QUERIES.FIND_LOGIN_RESULTS_BY_USERNAME,
      [username],
    );
  }

  public clearLoginResults(): void {
    this.executor.run(USER_QUERIES.DELETE_ALL_LOGIN_RESULTS);
  }
}

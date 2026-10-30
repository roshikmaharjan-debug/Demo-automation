import { DbConnection } from "./dbConnection";

export class SqlExecutor {
  public all<T = unknown>(sql: string, params: unknown[] = []): T[] {

    const db = DbConnection.getDatabase();
    return db.prepare(sql).all(...params) as T[];
  }

  public run(
    sql: string,
    params: unknown[] = [],
  ): { changes: number; lastInsertRowid: number | bigint } {

    const db = DbConnection.getDatabase();
    return db.prepare(sql).run(...params);
  }
}

import { DbConnection } from "./dbConnection";

export class SqlExecutor {
  public all<T = unknown>(sql: string, params: unknown[] = []): T[] {
    console.log(`[SQL all]: ${sql} | Params: ${JSON.stringify(params)}`);
    const db = DbConnection.getDatabase();
    return db.prepare(sql).all(...params) as T[];
  }

  public run(
    sql: string,
    params: unknown[] = [],
  ): { changes: number; lastInsertRowid: number | bigint } {
    console.log(`[SQL run]: ${sql} | Params: ${JSON.stringify(params)}`);
    const db = DbConnection.getDatabase();
    return db.prepare(sql).run(...params);
  }
}

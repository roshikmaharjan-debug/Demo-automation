import Database from "better-sqlite3";
import { DB_PATH } from "./dbConfig";

export class DbConnection {
  private static instance: Database.Database | null = null;

  public static getDatabase(): Database.Database {
    if (!this.instance) {
      this.instance = new Database(DB_PATH);
      this.instance.pragma("journal_mode = DELETE");
    }
    return this.instance;
  }

  public static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null;
    }
  }
}

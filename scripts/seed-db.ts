import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { DB_PATH } from "../tests/db/dbConfig";

const users = [
  {
    username: "standard_user",
    password: "secret_sauce",
    expected_type: "inventory",
    expected_message: null,
  },
  {
    username: "locked_out_user",
    password: "secret_sauce",
    expected_type: "error",
    expected_message: "Epic sadface: Sorry, this user has been locked out.",
  },
  {
    username: "problem_user",
    password: "secret_sauce",
    expected_type: "inventory",
    expected_message: null,
  },
  {
    username: "performance_glitch_user",
    password: "secret_sauce",
    expected_type: "inventory",
    expected_message: null,
  },
  {
    username: "error_user",
    password: "secret_sauce",
    expected_type: "inventory",
    expected_message: null,
  },
  {
    username: "visual_user",
    password: "secret_sauce",
    expected_type: "inventory",
    expected_message: null,
  },
  {
    username: "wrong_password_user",
    password: "wrong_password",
    expected_type: "error",
    expected_message:
      "Epic sadface: Username and password do not match any user in this service",
  },
];

export function seedDatabase(): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);

  try {
    const seed = db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          username TEXT PRIMARY KEY,
          password TEXT NOT NULL,
          expected_type TEXT NOT NULL,
          expected_message TEXT
        );

        CREATE TABLE IF NOT EXISTS login_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          outcome TEXT NOT NULL,
          ran_at TEXT NOT NULL
        );
      `);

      const insertUser = db.prepare(`
        INSERT INTO users (username, password, expected_type, expected_message)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          password = excluded.password,
          expected_type = excluded.expected_type,
          expected_message = excluded.expected_message;
      `);

      for (const user of users) {
        insertUser.run(
          user.username,
          user.password,
          user.expected_type,
          user.expected_message,
        );
      }
    });

    seed();
  } finally {
    db.close();
  }
}

if (require.main === module) {
  seedDatabase();
  console.log("Database seeded successfully.");
}

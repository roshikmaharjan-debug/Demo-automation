import fs from "fs";
import path from "path";

export interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
}

const ENV_FILE = path.resolve(__dirname, "../../.env");

let cachedConfig: ApiConfig | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Add it to .env (see .env.example) or set it in CI.`,
    );
  }
  return value;
}

export function getApiConfig(): ApiConfig {
  if (!cachedConfig) {
    if (fs.existsSync(ENV_FILE)) {
      process.loadEnvFile(ENV_FILE);
    }
    cachedConfig = {
      baseUrl: requireEnv("API_BASE_URL"),
      username: requireEnv("API_USERNAME"),
      password: requireEnv("API_PASSWORD"),
    };
  }
  return cachedConfig;
}

import { seedDatabase } from "../scripts/seed-db";

async function globalSetup(): Promise<void> {
  seedDatabase();
}

export default globalSetup;

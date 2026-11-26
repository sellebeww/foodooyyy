// tests/db/testDb.ts
import { createDb, type FoodooDb } from "../../src/db/schema.ts";

let counter = 0;

export function makeTestDb(): FoodooDb {
  counter += 1;
  return createDb(`foodoo-test-${counter}-${crypto.randomUUID()}`);
}

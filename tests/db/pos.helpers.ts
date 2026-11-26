// tests/db/pos.helpers.ts
import {
  completeSetup,
  saveMenu,
  savePlan,
  setMode,
  startSetup,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import type { SalesMode } from "../../src/domain/types.ts";

export async function freshStall(
  db: FoodooDb,
  mode: SalesMode,
  menuCount = 2,
): Promise<string[]> {
  await startSetup(db);
  const ids: string[] = [];
  for (let index = 0; index < menuCount; index += 1) {
    const menu = await saveMenu(db, {
      name: `Menu ${index + 1}`,
      price: 8000 + index * 1000,
      cost: 4500,
      salvage: 0,
      usualQty: 40,
    });
    ids.push(menu.id);
  }
  await completeSetup(db);
  await setMode(db, mode);
  return ids;
}

export async function planDay(
  db: FoodooDb,
  date: string,
  ids: readonly string[],
  cooked: number,
): Promise<void> {
  await savePlan(
    db,
    date,
    ids.map((menuId) => ({
      menuId,
      suggestedQty: cooked,
      reason: null,
      cookedQty: cooked,
    })),
  );
}

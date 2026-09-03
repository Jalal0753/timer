import Database from "@tauri-apps/plugin-sql";
import type { Session } from "../types";

export async function getSessions(): Promise<Session[]> {
  const database = await Database.load("sqlite:study.db");

  const result = await database.select<Session[]>(
    `
        SELECT id, category_id, started_at, duration FROM sessions 
        `,
  );
  return result;
}

export async function addSession(
  categoryId: number | null,
  duration: number,
): Promise<number> {
  const database = await Database.load("sqlite:study.db");

  const result = await database.execute(
    `
        INSERT INTO sessions (category_id, started_at, duration)
        VALUES ($1, $2, $3)
        `,
    [categoryId, new Date().toISOString(), duration],
  );

  return result.lastInsertId ?? 0;
}

import Database from "@tauri-apps/plugin-sql";
import type { Session, Task } from "../types";

async function getDb() {
  return await Database.load("sqlite:study.db");
}

export async function getSessions(): Promise<Session[]> {
  const database = await getDb();

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
  const database = await getDb();

  const result = await database.execute(
    `
        INSERT INTO sessions (category_id, started_at, duration)
        VALUES ($1, $2, $3)
        `,
    [categoryId, new Date().toISOString(), duration],
  );

  return result.lastInsertId ?? 0;
}

export async function getTasks(): Promise<Task[]> {
  const database = await getDb();

    return await database.select<Task[]>(`
      SELECT id, description
      FROM tasks
      ORDER BY id ASC
    `);
}

export async function addTask(
  description: string,
): Promise<number> {
  const database = await getDb();

  const result = await database.execute(
    `INSERT INTO tasks (description) VALUES ($1)`,
    [description.trim()],
  );

  return result.lastInsertId ?? 0;
}

export async function removeTask(id: number): Promise<void> {
  const database = await getDb();

  await database.execute(
    `DELETE FROM tasks WHERE id = $1`,
    [id],
  );
}

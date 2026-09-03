import Database from "@tauri-apps/plugin-sql";
import type { Category } from "../types";

let db: Database | null = null;

async function getDb() {
    if (!db) {
        db = await Database.load("sqlite:study.db");
    }

    return db;
}

export async function initDatabase() {
    const database = await getDb();

    await database.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL
        )
    `);
}

export async function getCategories(): Promise<Category[]> {
    const database = await getDb();

    return await database.select<Category[]>(`
        SELECT id, name, color
        FROM categories
        ORDER BY name ASC
    `);
}

export async function addCategory(name: string, color: string): Promise<number> {
    const database = await getDb();

    const result = await database.execute(
        `INSERT INTO categories (name, color) VALUES ($1, $2)`,
        [name.trim(), color]
    );

    return result.lastInsertId ?? 0;
}

export async function removeCategory(id: number): Promise<void> {
    const database = await getDb();

    await database.execute(
        `DELETE FROM categories WHERE id = $1`,
        [id]
    );
}
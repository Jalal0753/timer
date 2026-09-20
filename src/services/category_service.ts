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
            color TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        )
    `);

    await database.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NULL,
            started_at TEXT NOT NULL,
            duration INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (category_id)
                REFERENCES categories(id)
                ON DELETE SET NULL
        )
    `);

    await database.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL
        )
    `);

    const taskColumns = await database.select<{ name: string }[]>(
        `PRAGMA table_info(tasks)`
    );

    if (!taskColumns.some((column) => column.name === "description")) {
        await database.execute(`
            ALTER TABLE tasks
            ADD COLUMN description TEXT NOT NULL DEFAULT ''
        `);
    }
}

export async function resetDatabase() {
     const database = await getDb();

    await database.execute(`
        DELETE FROM tasks
    `);
    await database.execute(`
        DELETE FROM categories
    `);
    await database.execute(`
        DELETE FROM sessions
    `);
    await database.execute(`
        DELETE FROM sqlite_sequence
        WHERE name IN ('categories', 'sessions', 'tasks')
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

    const result = await database.select<{ count: number }[]>(
        `
        SELECT COUNT(*) AS count
        FROM sessions
        WHERE category_id = $1
        `,
        [id]
    );

    const used = (result[0]?.count ?? 0) > 0;

    if (used) {
        // La catégorie possède un historique :
        // on la désactive mais on la conserve.
        await database.execute(
            `
            UPDATE categories
            SET active = 0
            WHERE id = $1
            `,
            [id]
        );
    } else {
        // Jamais utilisée : suppression définitive
        await database.execute(
            `
            DELETE FROM categories
            WHERE id = $1
            `,
            [id]
        );
    }
}
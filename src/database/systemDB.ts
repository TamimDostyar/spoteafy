import Database from "better-sqlite3";

class DatabaseSystem {
    private db: Database.Database;

    constructor(databasePath: string) {
        this.db = new Database(databasePath);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS SPOTEAFY_CONVERSATION (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userText TEXT NOT NULL,
                aiText TEXT NOT NULL,
                songRecommended TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    writeSystemConversation(
        userText: string,
        aiText: string,
        songRecommended: string
    ): void {
        const stmt = this.db.prepare(`
            INSERT INTO SPOTEAFY_CONVERSATION
            (userText, aiText, songRecommended)
            VALUES (?, ?, ?)
        `);

        stmt.run(userText, aiText, songRecommended);
    }

    readSystemConversation(limit: number = 8) {
        const stmt = this.db.prepare(`
            SELECT userText, aiText, createdAt FROM SPOTEAFY_CONVERSATION
            ORDER BY createdAt DESC
            LIMIT ?;
        `);

        return stmt.all(limit);
    }

    close(): void {
        this.db.close();
    }
}

export default DatabaseSystem;
import express from "express";
import type { Request, Response } from "express";
import SystemManagement from "./core/use";

const app = express();
app.use(express.json());

app.post("/api/query", async (req: Request, res: Response) => {
    const query: unknown = req.body?.query;

    if (typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ error: "A non-empty 'query' string is required." });
    }

    try {
        const system = new SystemManagement(query, query);
        const result = await system.results();
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
    console.log(`Spoteafy API listening on http://localhost:${PORT}`);
});

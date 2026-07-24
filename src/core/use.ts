import { YT_API, Artificial_IntelligenceSystem } from "../apis/api";
import DatabaseSystem from "../database/systemDB";


import fs from "fs";
import path from "path";


const SHORT_MAX_SECONDS = 70;

function parseIsoDuration(iso: string): number {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) {
        return 0;
    }
    const hours = Number(m[1] ?? 0);
    const minutes = Number(m[2] ?? 0);
    const seconds = Number(m[3] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
}

class SystemManagement {
    private song: string;
    private userText: string;
    
    constructor(song: string, userText: string){
        this.song = song;
        this.userText = userText;
    }

    async readInstructionFile(): Promise<any> {
        const instructionPath = path.join(process.cwd(), "src", "metadata", "instruction.md");
        if (!fs.existsSync(instructionPath)){
            return "file not found"
        }

        const readFile = fs.readFileSync(instructionPath, "utf-8");
        return readFile;
    }

    async results(): Promise<any> {
        try {
            const yt = new YT_API("GET");

            let db: DatabaseSystem | null = null;
            try {
                db = new DatabaseSystem(
                    path.join(process.cwd(), "src", "database", "spoteafy.db")
                );
            } catch (dbErr) {
                console.error("DB open failed:", dbErr);
            }

            let searchQuery = this.userText || this.song;
            try {
                let summary = "";
                if (db) {
                    const readConv = db.readSystemConversation(8) as Array<{
                        userText: string;
                        aiText: string;
                    }>;
                    summary = readConv
                        .reverse()
                        .map((r) => `User: ${r.userText}\nAI: ${r.aiText}`)
                        .join("\n");
                }

                const instruction = await this.readInstructionFile();
                const ai = new Artificial_IntelligenceSystem(this.userText, instruction);
                const aiOut = await ai.ai_engine(summary);

                const cleaned = String(aiOut)
                    .replace(/<think>[\s\S]*?<\/think>/gi, "")
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .pop();
                const finalQuery = (cleaned ?? "").replace(/^["'\s]+|["'\s]+$/g, "").trim();
                if (finalQuery) {
                    searchQuery = finalQuery;
                }
            } catch (aiErr) {
                console.error("AI query step failed; using raw text:", aiErr);
            }

            const searchSong = await yt.searchSongs(searchQuery);
            const outputSearchSong = await searchSong.json();

            const items: any[] = Array.isArray(outputSearchSong.items)
                ? outputSearchSong.items
                : [];
            const candidates = items
                .filter((it) => it?.id?.videoId)
                .filter((it) => !/#shorts?\b/i.test(it.snippet?.title ?? ""))
                .map((it) => ({
                    videoId: it.id.videoId,
                    title: it.snippet?.title ?? "",
                    channel: it.snippet?.channelTitle ?? "",
                    thumbnail:
                        it.snippet?.thumbnails?.high?.url ??
                        it.snippet?.thumbnails?.medium?.url ??
                        it.snippet?.thumbnails?.default?.url ??
                        ""
                }));

            let tracks = candidates;
            try {
                if (candidates.length > 0) {
                    const detailsRes = await yt.videoDetails(
                        candidates.map((c) => c.videoId)
                    );
                    const details = await detailsRes.json();
                    const durations = new Map<string, number>();
                    for (const d of details.items ?? []) {
                        durations.set(d.id, parseIsoDuration(d.contentDetails?.duration ?? ""));
                    }
                    const filtered = candidates.filter(
                        (c) => (durations.get(c.videoId) ?? 0) > SHORT_MAX_SECONDS
                    );
                    if (filtered.length > 0) {
                        tracks = filtered;
                    }
                }
            } catch (durErr) {
                console.error("Shorts duration filter skipped:", durErr);
            }

            const track = tracks[0] ?? null;

            if (db) {
                try {
                    const assistantText = track
                        ? `Played "${track.title}" by ${track.channel}`
                        : "No matching song found";
                    db.writeSystemConversation(
                        this.userText,
                        assistantText,
                        JSON.stringify(track)
                    );
                } catch (writeErr) {
                    console.error(writeErr);
                }
                db.close();
            }

            return { output: searchQuery, track, results: tracks };
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default SystemManagement;
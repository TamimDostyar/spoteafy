import { useState } from "react";
import logo from "../assets/icon.png";

type ChatMessage = { role: "ai" | "me"; text: string };

interface Track {
    videoId: string;
    title: string;
    channel: string;
    thumbnail: string;
}

interface QueryResult {
    output?: string;
    track?: Track | null;
    results?: Track[];
    error?: string;
}

async function askSpoteafy(query: string): Promise<QueryResult> {
    const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });
    return res.json();
}


function decodeHtml(input: string): string {
    const el = document.createElement("textarea");
    el.innerHTML = input;
    return el.value;
}

function cleanTrack(t: Track): Track {
    return { ...t, title: decodeHtml(t.title), channel: decodeHtml(t.channel) };
}

const Icon = {
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
        </svg>
    ),
    spark: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5 13.9 8 20 9.5 15.5 13l1 6-4.5-3-4.5 3 1-6L4 9.5 10.1 8z" opacity=".55" />
            <path d="M18.5 3 19.4 5.4 22 6l-2.3 1.4.5 2.6-2-1.4-2 1.4.5-2.6L14 6l2.6-.6z" />
        </svg>
    ),
    note: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 17.5a2.5 2.5 0 1 1-2.5-2.5c.55 0 1.06.18 1.5.47V6l10-2v9.5a2.5 2.5 0 1 1-2.5-2.5c.55 0 1.06.18 1.5.47V6.3L9 7.9z" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z" />
        </svg>
    ),
    send: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.4 3.3 21 12 3.4 20.7l1.9-7.2L14 12 5.3 10.5z" />
        </svg>
    )
};

export function Interface() {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [results, setResults] = useState<Track[]>([]);
    const [history, setHistory] = useState<Track[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "ai", text: "Hey 👋 Tell me a song or a vibe — e.g. “play Blinding Lights”." }
    ]);

    const [searchDraft, setSearchDraft] = useState("");
    const [chatDraft, setChatDraft] = useState("");
    const [sending, setSending] = useState(false);

    function playTrack(track: Track) {
        setCurrentTrack(track);
        setHistory((prev) =>
            [track, ...prev.filter((t) => t.videoId !== track.videoId)].slice(0, 12)
        );
    }

    async function runQuery(query: string) {
        const q = query.trim();
        if (!q || sending) {
            return;
        }

        setMessages((prev) => [...prev, { role: "me", text: q }]);
        setSending(true);

        try {
            const data = await askSpoteafy(q);

            if (data.error) {
                setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${data.error}` }]);
                return;
            }

            const tracks = (data.results ?? []).map(cleanTrack);
            setResults(tracks);

            const picked = data.track ? cleanTrack(data.track) : tracks[0];
            if (picked) {
                playTrack(picked);
                setMessages((prev) => [...prev, { role: "ai", text: `▶ Playing: ${picked.title}` }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "ai", text: "No matching song found. Try another search." }
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "⚠️ Couldn't reach the server. Is `npm run server` running?" }
            ]);
        } finally {
            setSending(false);
        }
    }

    function renderCard(t: Track) {
        return (
            <button className="card" key={t.videoId} onClick={() => playTrack(t)}>
                <div className="card__art">
                    <img src={t.thumbnail} alt="" className="fill-img" />
                    <span className="card__play">{Icon.play}</span>
                </div>
                <div className="card__title">{t.title}</div>
                <div className="card__sub">{t.channel}</div>
            </button>
        );
    }

    return (
        <div className="app">
            <section className="stage">
                <header className="stage__top">
                    <div className="brand">
                        <img className="brand__logo" src={logo} alt="Spoteafy logo" />
                        <div className="brand__name">
                            Spot<span>eafy</span>
                        </div>
                    </div>
                    <label className="search">
                        {Icon.search}
                        <input
                            placeholder="Play a song…  e.g. play Bohemian Rhapsody"
                            value={searchDraft}
                            onChange={(e) => setSearchDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    runQuery(searchDraft);
                                    setSearchDraft("");
                                }
                            }}
                        />
                    </label>
                </header>

                <div className="stage__scroll">
                    <div className="player">
                        <div className="player__screen">
                            {currentTrack ? (
                                <iframe
                                    title="Spoteafy player"
                                    className="fill-img"
                                    src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=1&rel=0`}
                                    allow="autoplay; encrypted-media; fullscreen"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="player__empty">
                                    {Icon.note}
                                    <p>Ask the AI to play a song to get started.</p>
                                </div>
                            )}
                        </div>
                        {currentTrack && (
                            <div className="player__meta">
                                <div className="player__title">{currentTrack.title}</div>
                                <div className="player__channel">{currentTrack.channel}</div>
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <section className="row">
                            <h3 className="row__title">Results</h3>
                            <div className="grid">{results.map(renderCard)}</div>
                        </section>
                    )}

                    {history.length > 0 && (
                        <section className="row">
                            <h3 className="row__title">Recently played</h3>
                            <div className="grid">{history.map(renderCard)}</div>
                        </section>
                    )}
                </div>
            </section>

            <aside className="chat">
                <div className="chat__head">
                    <span className="chat__badge">{Icon.spark}</span>
                    <div>
                        <h4>Spoteafy AI</h4>
                        <span className="chat__status">● Online</span>
                    </div>
                </div>

                <div className="chat__body">
                    {messages.map((m, i) => (
                        <div className={`msg msg--${m.role}`} key={i}>
                            {m.text}
                        </div>
                    ))}
                    {sending && <div className="msg msg--ai">Searching YouTube…</div>}
                </div>

                <div className="chat__foot">
                    <input
                        placeholder="Ask the AI to play something…"
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                runQuery(chatDraft);
                                setChatDraft("");
                            }
                        }}
                        disabled={sending}
                    />
                    <button
                        className="chat__send"
                        aria-label="Send"
                        disabled={sending}
                        onClick={() => {
                            runQuery(chatDraft);
                            setChatDraft("");
                        }}
                    >
                        {Icon.send}
                    </button>
                </div>
            </aside>
        </div>
    );
}

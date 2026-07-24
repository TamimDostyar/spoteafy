import { YOUTUBE_API, GOOGLE_PATH, GROQ_API_KEY, AI_MODEL, 
    TEMPERATURE, MAX_COMPLETION_TOKENS, TOP_P, STREAM, REASONING_EFFORT, STOP
} from "../configuration/config";
import { Groq } from 'groq-sdk';

class YT_API {
    private method: string;

    constructor(method: string) {
        this.method = method;

        if (!this.method) {
            this.method = "GET";
        }
    }

    async runEngine(e_method: string | null): Promise<Response> {
        if (e_method === null) {
            e_method = this.method;
        }

        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        const requestOptions = {
            method: e_method,
            headers
        };

        if (!GOOGLE_PATH) {
            throw new Error("Google path is not found.");
        }

        const response = await fetch(GOOGLE_PATH, requestOptions);

        if (!response.ok) {
            throw new Error(
                "The server resoundingly rebuked our headers: " +
                    response.statusText
            );
        }

        return response;
    }

    async searchSongs(searchSong: string): Promise<Response> {
        if (!GOOGLE_PATH) {
            throw new Error("Google path is not found.");
        }

        if (!YOUTUBE_API) {
            throw new Error("YouTube API key is not found.");
        }

        const address = `${GOOGLE_PATH}search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(
            searchSong
        )}&key=${YOUTUBE_API}`;

        const response = await fetch(address, {
            method: this.method,
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                "The server resoundingly rebuked our headers: " +
                    response.statusText
            );
        }

        return response;
    }

    async videoDetails(ids: string[]): Promise<Response> {
        if (!GOOGLE_PATH) {
            throw new Error("Google path is not found.");
        }

        if (!YOUTUBE_API) {
            throw new Error("YouTube API key is not found.");
        }

        const address = `${GOOGLE_PATH}videos?part=contentDetails&id=${ids.join(
            ","
        )}&key=${YOUTUBE_API}`;

        const response = await fetch(address, {
            method: this.method,
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                "The server resoundingly rebuked our headers: " +
                    response.statusText
            );
        }

        return response;
    }
}

class Artificial_IntelligenceSystem{

    private text: string;
    private instruction: any;

    constructor(text: string, instruction: any){
        this.text = text
        this.instruction = instruction;
    }
    async ai_engine(oldConversation: any): Promise<any> {

        if (!GROQ_API_KEY){
            throw new Error("Groq key not found");
        }

        if (!AI_MODEL){
            throw new Error("ai mode is not found");
        }

        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
        "messages": [
                {
                    "role": "system",
                    "content": this.instruction
                },
                {
                    "role": "user",
                    "content": `Conversation so far:\n${oldConversation}`
                },
                {
                    "role": "user",
                    "content": this.text
                },
            ],
            "model": AI_MODEL,
            "temperature": TEMPERATURE,
            "max_completion_tokens": MAX_COMPLETION_TOKENS,
            "top_p": TOP_P,
            "stream": STREAM,
            "reasoning_effort": REASONING_EFFORT,
            "stop": STOP
        });

        let content = "";
        for await (const chunk of chatCompletion) {
            content += chunk.choices[0]?.delta?.content || '';
        }
        return content;
    }
}

export {Artificial_IntelligenceSystem, YT_API}

import { YOUTUBE_API, GOOGLE_PATH } from "../configuration/config";

console.log(YOUTUBE_API);
console.log(GOOGLE_PATH);

class YT_API {
    private method: string;

    constructor(method: string) {
        this.method = method;

        if (!this.method) {
            this.method = "GET";
        }
    }

    async runEngine(e_method: string | null): Promise<Response> {
        // Use the default method if none is provided
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

        const address = `${GOOGLE_PATH}search?part=snippet&type=video&q=${encodeURIComponent(
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
}


class SystemManagement extends YT_API{
    private song: string;

    constructor(method: string, song: string){
        super(method)
        this.song = song;
    }


    async results(): Promise<any> {
        try {
            const response = await this.searchSongs(this.song);
            const data = await response.json();

            console.log(data);
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
// async function main() {
//     const a = new SystemManagement("GET", "adele");

//     const results = await a.results();
//     console.log(results);
// }

// main().catch(console.error);

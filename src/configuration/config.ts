import dotenv from 'dotenv'
dotenv.config()

const YOUTUBE_API=process.env.YOUTUBE_API;
const GOOGLE_PATH=process.env.GOOGLE_PATH;
const GROQ_API_KEY=process.env.GROQ_API_KEY;
const AI_MODEL=process.env.AI_MODEL;



const TEMPERATURE = 0.6;
const MAX_COMPLETION_TOKENS = 2048;
const TOP_P = 0.95;
const STREAM = true;
const REASONING_EFFORT = "default";
const STOP = null;


export {YOUTUBE_API, GOOGLE_PATH, GROQ_API_KEY, AI_MODEL, TEMPERATURE, MAX_COMPLETION_TOKENS, TOP_P, STREAM, REASONING_EFFORT, STOP};
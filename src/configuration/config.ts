import dotenv from 'dotenv'
dotenv.config()

const YOUTUBE_API=process.env.YOUTUBE_API;
const GOOGLE_PATH=process.env.GOOGLE_PATH;

console.log(GOOGLE_PATH);

export {YOUTUBE_API, GOOGLE_PATH};
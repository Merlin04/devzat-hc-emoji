import Devzat from "devzat";
import fetch from "node-fetch";
import "ts-replace-all";

if(!process.env.DEVZAT_TOKEN) throw new Error("DEVZAT_TOKEN environment variable is not defined");
if(!process.env.DEVZAT_ADDRESS) throw new Error("DEVZAT_ADDRESS environment variable is not defined");

const plugin = new Devzat({
    address: process.env.DEVZAT_ADDRESS,
    token: process.env.DEVZAT_TOKEN,
    name: "Hack Club Emoji Middleware"
});

let emojiNames: string[] = [];

(async function updateEmojiNames() {
    const res = await fetch("https://e.benjaminsmith.dev/index.json");
    const data = (await res.json()) as {
        emoji: {
            [key: string]: string
        }
    };
    emojiNames = Object.keys(data.emoji);
    console.log("Updated emoji names");

    setTimeout(updateEmojiNames, 1000 * 60 * 60 /* 1 hour */);
})();

plugin.onMessageSend({
    middleware: true
}, message => {
    if(message.msg.length < 4) return;

    let emojiName = "";
    let result = "";
    let inEmojiName = false;
    let emojis: string[] = [];
    for(let i = 0; i < message.msg.length - 1; i++) {
        if(inEmojiName) {
            emojiName += message.msg[i];
        }
        if(!inEmojiName ? (message.msg[i] === ":" && message.msg[i-1] === ":") : (message.msg[i+1] === ":" && message.msg[i+2] === ":")) {
            inEmojiName = !inEmojiName;
            if(!inEmojiName) {
                emojis.push(emojiName);
                emojiName = "";
            }
        }
        result += message.msg[i];
    }
    result += message.msg[message.msg.length - 1];
    if(emojis.length > 0) {
        const toAdd = fetchEmoji(emojis);
        result += toAdd;
    }
    return result;
});

const fetchEmoji = (names: string[]) => names.reduce((acc, name) => acc + fetchEmojiSingle(name), "");

const fetchEmojiSingle = (name: string) => emojiNames.includes(name) ? `![${name}](https://e.benjaminsmith.dev/${name})` : "";
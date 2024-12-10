// services/Request.js
import OpenAI from "openai/index.mjs";

// Erstat "YOUR_API_KEY" med din OpenAI API-nøgle
const openai = new OpenAI({ apiKey: "" });

export default async function SendMessage(messageArray) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messageArray,
    });
    const result = response.choices[0]?.message?.content || "";
    return { role: "assistant", content: result };
}

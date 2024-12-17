// services/Request.js
// Inspiration er taget fra https://github.com/Innovationg-og-ny-teknologi-2021/07_GenAI_Code
// VIGTIGT: Indsæt din API-nøgle nedenfor for at aktivere AI-bottens funktionalitet.
// Uden API-nøglen vil AI-chat-supporten ikke fungere.
//API-Nøglen findes i rapporten.
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

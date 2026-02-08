import OpenAI from "openai";
import fs from "fs";

// Simple helper to read .env.local manually
const envContent = fs.readFileSync(".env.local", "utf8");
const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.*)/);
const modelMatch = envContent.match(/OPENAI_MODEL=(.*)/);

const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;
const MODEL_NAME = modelMatch ? modelMatch[1].trim() : "gpt-4o-mini";

if (!API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing in .env.local");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: API_KEY });

async function testOpenAI() {
    console.log(`🚀 Testing OpenAI SDK with model: ${MODEL_NAME}...`);

    try {
        const response = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: "Say 'READY'" }],
        });

        console.log("✅ OpenAI Response:", response.choices[0].message.content);
        console.log("✨ Test Passed!");
    } catch (e) {
        console.error("❌ OpenAI Test Failed:", e);
    }
}

testOpenAI();

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Simple helper to read .env.local manually
const envContent = fs.readFileSync(".env.local", "utf8");
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
const modelMatch = envContent.match(/NEXT_PUBLIC_GEMINI_MODEL=(.*)/);

const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;
const MODEL_NAME = modelMatch ? modelMatch[1].trim() : "gemini-2.0-flash";

if (!API_KEY || API_KEY === "YOUR_KEY_HERE") {
    console.error("❌ ERROR: NEXT_PUBLIC_GEMINI_API_KEY is missing in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testSDK() {
    console.log(`🚀 Testing Gemini SDK with model: ${MODEL_NAME}...`);

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = "Generate a JSON object with a key 'status' and value 'SDK_WORKING'.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ SDK Response:", text);
        console.log("✨ Test Passed!");
    } catch (e) {
        console.error("❌ SDK Test Failed:", e);
    }
}

testSDK();

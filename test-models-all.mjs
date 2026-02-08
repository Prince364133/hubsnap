import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBrrliXEEM4ZYbDEovp6sXjqUbLQy06otg";

async function testModel(modelName) {
    console.log(`\n🔍 Testing model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'READY'");
        const response = await result.response;
        console.log(`✅ ${modelName} works:`, response.text());
    } catch (e) {
        console.error(`❌ ${modelName} failed:`, e.status, e.message);
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-2.0-flash");
}

run();


import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const API_KEY = env.NVIDIA_API_KEY;
const BASE_URL = env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const MODEL = env.NVIDIA_MODEL || "moonshotai/kimi-k2.5";

console.log("Testing NVIDIA API Connection...");
console.log("URL:", BASE_URL);
console.log("Model:", MODEL);
console.log("API Key found:", !!API_KEY);

async function test() {
    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: "Say 'Hello from NVIDIA' if you can read this." }],
                max_tokens: 100,
                temperature: 0.5,
                stream: false
            })
        });

        if (!response.ok) {
            console.error("Response not OK:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            process.exit(1);
        }

        const data = await response.json();
        console.log("Success! Response:");
        console.log(JSON.stringify(data.choices[0].message.content, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

test();

const https = require('https');
const fs = require('fs');
const path = require('path');

// Value from .env.local manually (since we can't easily parse env without dotenv pkg in raw node)
// Or better, just read the file manually
function getEnvValue(key) {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith(key + '=')) {
                return line.split('=')[1].trim();
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

async function testNvidia() {
    console.log("Testing NVIDIA API connection (Node.js)...");

    // Hardcoding for test reliability if read fails, but let's try read first
    let apiKey = getEnvValue('NVIDIA_API_KEY');
    let baseURL = getEnvValue('NVIDIA_BASE_URL') || "https://integrate.api.nvidia.com/v1";
    let model = getEnvValue('NVIDIA_MODEL') || "moonshotai/kimi-k2.5";

    if (!apiKey) {
        console.error("❌ ERROR: NVIDIA_API_KEY is missing in .env.local");
        process.exit(1);
    }

    console.log(`URL: ${baseURL}`);
    console.log(`Model: ${model}`);
    console.log(`Key Present: Yes`);

    try {
        const response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: "Hello! Reply with 'Connection successful' if you receive this." }],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`);
            console.error(`Response: ${text}`);
            process.exit(1);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        console.log("\n✅ Connection Successful!");
        console.log(`Response: "${content}"`);

    } catch (e) {
        console.error("❌ Exception during request:", e);
        process.exit(1);
    }
}

testNvidia();

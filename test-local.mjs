const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL = "creatoros-local";

async function testLocalAI() {
    console.log(`Testing Local AI (${MODEL})...`);
    const prompt = "Explain why the sky is blue in one sentence.";

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5:3b", // Fallback to base model for connectivity test
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response:", data.response);
        console.log("✅ Local AI Integration Verified!");
    } catch (e) {
        console.error("❌ Test Failed:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

testLocalAI();

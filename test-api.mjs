// This file is deprecated - we use NVIDIA API instead
// See .env.local for NVIDIA_API_KEY configuration

/*
const apiKey = "AIzaSyCqSUVRhhvbaH3wA85qmu-EKDxazjQJwWU";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function test() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, answer with 'SUCCESS' if you get this." }] }]
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

test();
*/


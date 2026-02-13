"use server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:5001/start-ups-64204/us-central1/process_text";

interface PythonResponse {
    result?: any;
    error?: string;
}

export async function processText(action: "extract_keywords" | "summarize" | "clean_text" | "readability" | "analyze_content_history", text: string, params: any = {}): Promise<any> {
    try {
        console.log(`[Python-Lib] Calling ${action}...`);
        const response = await fetch(PYTHON_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, text, params }),
            cache: "no-store"
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Python-Lib] HTTP Error: ${response.status} ${errorText}`);
            return null; // Fail safe
        }

        const data: PythonResponse = await response.json();

        if (data.error) {
            console.error(`[Python-Lib] API Error: ${data.error}`);
            return null;
        }

        return data.result;

    } catch (error) {
        console.error(`[Python-Lib] Network Error:`, error);
        return null;
    }
}

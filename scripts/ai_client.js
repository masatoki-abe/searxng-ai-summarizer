/**
 * Base class for AI Clients
 */
class AIClient {
    constructor(apiKey, model, baseUrl) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    async summarize(text) {
        throw new Error("Not implemented");
    }
}

/**
 * Client for Google's Gemini API
 */
class GeminiClient extends AIClient {
    constructor(apiKey, model) {
        super(apiKey, model || "gemini-2.5-flash-lite");
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    }

    async summarize(text) {
        const prompt = `
以下の検索結果のテキストを、日本語で簡潔に要約してください。
重要なポイントを箇条書きで3〜5点にまとめてください。
検索キーワードや文脈が不明な場合は、与えられたテキストのみに基づいて要約してください。

テキスト:
${text}
    `;

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": this.apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Gemini API Error");
        }

        const data = await response.json();
        console.log("Gemini API Response:", JSON.stringify(data, null, 2));

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No candidates returned from Gemini API.");
        }

        const candidate = data.candidates[0];
        if (candidate.finishReason !== undefined && candidate.finishReason !== null && candidate.finishReason !== "STOP") {
            // Handle safety blocking or other reasons
            if (candidate.finishReason === "SAFETY") {
                throw new Error("Summary generation was blocked by safety filters.");
            }
            // If content is present despite other finish reasons (e.g. MAX_TOKENS), use it, otherwise throw
            if (!candidate.content) {
                throw new Error(`Generation stopped: ${candidate.finishReason}`);
            }
        }

        if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
            throw new Error("Invalid response structure from Gemini API.");
        }

        return candidate.content.parts[0].text;
    }
}

// Factory function
function createClient(apiKey, model) {
    return new GeminiClient(apiKey, model);
}

// Export for use in background.js
export { createClient };

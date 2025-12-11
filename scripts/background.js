
import { createClient } from './ai_client.js';

console.log('Background Script Loaded');

// Listen for messages from content script
browser.runtime.onMessage.addListener((request, sender) => {
    if (request.action === 'summarize') {
        // Return Promise to send response asynchronously
        return handleSummarizeRequest(request.text, sender);
    } else if (request.action === 'open_options') {
        browser.runtime.openOptionsPage();
    }
});

async function handleSummarizeRequest(text, sender) {
    try {
        const settings = await browser.storage.local.get(['apiKey', 'model']);

        if (!settings.apiKey) {
            return { success: false, error: 'Gemini API Key missing. Please open extension settings.' };
        }

        const client = createClient(settings.apiKey, settings.model);
        const summary = await client.summarize(text);
        console.log("Summary generated successfully.");

        return {
            success: true,
            data: summary
        };

    } catch (error) {
        console.error("Summarization failed in background:", error);
        return {
            success: false,
            error: error.message || "Unknown background error"
        };
    }
}

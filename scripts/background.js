
import { createClient } from './ai_client.js';

console.log('Background Script Loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarize') {
        // Return true to indicate we will send a response asynchronously
        handleSummarizeRequest(request.text, sender, sendResponse);
        return true;
    }
});

async function handleSummarizeRequest(text, sender, sendResponse) {
    try {
        const settings = await chrome.storage.local.get(['apiKey', 'model']);

        if (!settings.apiKey) {
            sendResponse({ success: false, error: 'Gemini API Key missing. Please open extension settings.' });
            return;
        }

        const client = createClient(settings.apiKey, settings.model);
        const summary = await client.summarize(text);
        console.log("Summary generated successfully.");

        sendResponse({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error("Summarization failed in background:", error);
        sendResponse({
            success: false,
            error: error.message || "Unknown background error"
        });
    }
}

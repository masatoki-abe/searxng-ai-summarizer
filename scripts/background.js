
import { createClient } from './ai_client.js';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarize') {
        // Acknowledge immediately to avoid "message port closed" or "out of scope" errors
        sendResponse({ status: 'processing' });

        // Start async processing without keeping the message port open
        handleSummarizeRequest(request.text, sender);
        return false; // Sync response sent
    }
});

async function handleSummarizeRequest(text, sender) {
    try {
        const settings = await chrome.storage.local.get(['apiKey', 'model']);

        if (!settings.apiKey) {
            if (sender.tab && sender.tab.id) {
                chrome.tabs.sendMessage(sender.tab.id, { action: 'summary_result', success: false, error: 'Gemini API Key missing. Please open extension settings.' });
            }
            return;
        }

        const client = createClient(settings.apiKey, settings.model);
        const summary = await client.summarize(text);
        console.log("Summary generated successfully. Sending message to tab", sender.tab.id);

        // Use sendMessage instead of sendResponse to avoid channel closure/timeout issues
        chrome.tabs.sendMessage(sender.tab.id, {
            action: 'summary_result',
            success: true,
            data: summary
        });

    } catch (error) {
        console.error("Summarization failed in background:", error);
        if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'summary_result',
                success: false,
                error: error.message || "Unknown background error"
            });
        }
    }
}
console.log('Background Script Loaded');

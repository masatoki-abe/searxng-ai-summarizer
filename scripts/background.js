
import { createClient } from './ai_client.js';

console.log('Background Script Loaded');

// コンテンツスクリプトからのメッセージをリッスン
browser.runtime.onMessage.addListener((request, sender) => {
    if (request.action === 'summarize') {
        // 非同期レスポンスのためにPromiseを返す
        return handleSummarizeRequest(request.text, sender);
    } else if (request.action === 'open_options') {
        browser.runtime.openOptionsPage();
    }
});

async function handleSummarizeRequest(text, sender) {
    try {
        const settings = await browser.storage.local.get(['apiKey', 'model']);

        if (!settings.apiKey) {
            return { success: false, error: 'Gemini APIキーが設定されていません。拡張機能の設定画面を開いてください。' };
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
            error: error.message || "バックグラウンドで不明なエラーが発生しました"
        };
    }
}

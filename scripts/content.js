// Helper to identify if we are on a SearXNG page
function isSearxngPage() {
    // Common SearXNG selectors
    const hasResultList = document.getElementById('urls') || document.getElementById('results') || document.querySelector('.result-list');
    const hasSearchInput = document.querySelector('input[name="q"]');
    // Check footer or meta tags if needed, but existence of result list is usually good enough for "any" instance
    // We can also check specific classes like .searxng-navbar, etc.
    return !!(hasResultList && hasSearchInput);
}

function getResultSnippets() {
    // Try to find results
    const results = document.querySelectorAll('.result');
    if (!results.length) return null;

    let combinedText = "";
    // Limit to top 10 results to avoid token limits
    const topResults = Array.from(results).slice(0, 10);

    topResults.forEach((el, index) => {
        const title = el.querySelector('h3, .title')?.innerText || "";
        const content = el.querySelector('.content')?.innerText || "";
        if (title || content) {
            combinedText += `Result ${index + 1}:\nTitle: ${title}\nContent: ${content}\n\n`;
        }
    });

    return combinedText;
}

function injectUI() {
    if (document.getElementById('searxng-ai-summary-btn')) return;

    const resultsContainer = document.getElementById('urls') || document.getElementById('results') || document.querySelector('#main_results');
    if (!resultsContainer) return;

    // Create Button
    const btn = document.createElement('button');
    btn.id = 'searxng-ai-summary-btn';
    btn.className = 'ai-summary-btn';
    btn.innerText = '✨ Summarize Results (AI)';
    btn.onclick = handleSummarizeClick;

    // Inject before results
    resultsContainer.parentNode.insertBefore(btn, resultsContainer);

    // Container for summary (initially hidden or empty)
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'searxng-ai-summary-container';
    summaryContainer.style.display = 'none';
    resultsContainer.parentNode.insertBefore(summaryContainer, resultsContainer);
}

async function handleSummarizeClick(e) {
    const btn = e.target;
    const container = document.getElementById('searxng-ai-summary-container');
    const snippets = getResultSnippets();

    if (!snippets) {
        alert("No search results found to summarize.");
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Generating Summary...';

    container.style.display = 'block';
    container.innerHTML = '<div class="ai-spinner"></div>';

    // Setup listener for the result
    const resultListener = (message) => {
        if (message.action === 'summary_result') {
            console.log("Received async result:", message);
            chrome.runtime.onMessage.removeListener(resultListener); // Cleanup

            if (message.success) {
                container.innerHTML = `
          <div class="ai-summary-header">
            <span class="ai-summary-title">✨ AI Summary</span>
          </div>
          <div class="ai-summary-content">${formatSummary(message.data)}</div>
        `;
                btn.innerText = 'Summarize Results (AI)';
            } else {
                const errorMsg = message.error || "Unknown error";
                console.error("Async Error:", errorMsg);
                container.innerHTML = `<div style="color:red; font-weight:bold; padding:10px; border:1px solid red;">Error: ${errorMsg}</div>`;
                btn.innerText = 'Error - Try Again';
                alert(`Summary Failed:\n${errorMsg}`);
            }
            btn.disabled = false;
        }
    };
    chrome.runtime.onMessage.addListener(resultListener);

    try {
        console.log("Sending request to background...");
        // We don't await the response content here, just the sending status
        await chrome.runtime.sendMessage({
            action: 'summarize',
            text: snippets
        });
        // The actual data comes back via the listener above

    } catch (err) {
        console.error("Content Script Send Error:", err);
        chrome.runtime.onMessage.removeListener(resultListener);
        container.innerHTML = `<div style="color:red">Error: ${err.message}</div>`;
        btn.innerText = 'Error - Try Again';
        alert(`Request Failed:\n${err.message}`);
        btn.disabled = false;
    }
}

function formatSummary(text) {
    // Simple markdown-ish to HTML or just text
    // The API returns plain text usually, maybe markdown.
    // We'll escape HTML and convert newlines.
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\n/g, '<br>');
}

// Run logic
if (isSearxngPage()) {
    injectUI();
}

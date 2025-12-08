// Helper to identify if we are on a SearXNG page
function isSearxngPage() {
    const hasResultList = document.getElementById('urls') || document.getElementById('results') || document.querySelector('.result-list');
    const hasSearchInput = document.querySelector('input[name="q"]');
    return !!(hasResultList && hasSearchInput);
}

function getResultSnippets() {
    const results = document.querySelectorAll('.result');
    if (!results.length) return null;

    let combinedText = "";
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

    const btn = document.createElement('button');
    btn.id = 'searxng-ai-summary-btn';
    btn.className = 'ai-summary-btn';
    btn.innerText = '✨ Summarize Results (AI)';
    btn.onclick = handleSummarizeClick;

    resultsContainer.parentNode.insertBefore(btn, resultsContainer);

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

    try {
        // Refactored to use async/await and remove event listener leak
        const response = await chrome.runtime.sendMessage({
            action: 'summarize',
            text: snippets
        });

        if (response && response.success) {
            container.innerHTML = `
          <div class="ai-summary-header">
            <span class="ai-summary-title">✨ AI Summary</span>
          </div>
          <div class="ai-summary-content">${formatSummary(response.data)}</div>
        `;
            btn.innerText = 'Summarize Results (AI)';
        } else {
            const errorMsg = response?.error || chrome.runtime.lastError?.message || "Unknown error";
            console.error("Async Error:", errorMsg);
            container.innerHTML = `<div style="color:red; font-weight:bold; padding:10px; border:1px solid red;">Error: ${errorMsg}</div>`;
            btn.innerText = 'Error - Try Again';
            alert(`Summary Failed:\n${errorMsg}`);
        }

    } catch (err) {
        console.error("Content Script Send Error:", err);
        container.innerHTML = `<div style="color:red">Error: ${err.message}</div>`;
        btn.innerText = 'Error - Try Again';
        alert(`Request Failed:\n${err.message}`);
    } finally {
        btn.disabled = false;
    }
}

function formatSummary(text) {
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
}

if (isSearxngPage()) {
    injectUI();
}

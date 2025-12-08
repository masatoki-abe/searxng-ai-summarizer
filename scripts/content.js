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
    if (document.getElementById('searxng-ai-wrapper')) return;

    const resultsContainer = document.getElementById('urls') || document.getElementById('results') || document.querySelector('#main_results');
    if (!resultsContainer) return;

    // Create Wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'searxng-ai-wrapper';
    wrapper.className = 'searxng-ai-wrapper';

    // Create Button
    const btn = document.createElement('button');
    btn.id = 'searxng-ai-summary-btn';
    btn.className = 'ai-summary-btn';
    btn.innerText = '✨ Summarize Results (AI)';
    btn.onclick = handleSummarizeClick;
    btn.style.marginBottom = '0'; // Reset margin as it is in wrapper

    // Create Summary Container (initially hidden)
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'searxng-ai-summary-container';
    summaryContainer.style.display = 'none';

    // Append to wrapper
    wrapper.appendChild(btn);
    wrapper.appendChild(summaryContainer);

    // Inject wrapper before results
    resultsContainer.parentNode.insertBefore(wrapper, resultsContainer);
}

async function handleSummarizeClick(e) {
    const btn = e.target;
    // Use the container within our wrapper
    const container = document.getElementById('searxng-ai-summary-container');
    const snippets = getResultSnippets();

    if (!snippets) {
        alert("No search results found to summarize.");
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Generating Summary...';

    // Ensure container is visible
    if (container) {
        container.style.display = 'block';
        container.innerHTML = '<div class="ai-spinner"></div>';
    }

    try {
        console.log("Sending request to background...");
        // Await the response directly
        const response = await chrome.runtime.sendMessage({
            action: 'summarize',
            text: snippets
        });

        console.log("Received response from background:", response);

        if (response && response.success) {
            console.log("Success! Updating UI...");

            // Re-fetch to be safe
            const currentContainer = document.getElementById('searxng-ai-summary-container');

            if (currentContainer) {
                currentContainer.style.display = 'block';
                currentContainer.innerHTML = `
                  <div class="ai-summary-header">
                    <span class="ai-summary-title">✨ AI Summary</span>
                  </div>
                  <div class="ai-summary-content">${formatSummary(response.data)}</div>
                `;
            } else {
                console.error("Summary container missing.");
                alert("Error: UI container missing.");
            }

            btn.innerText = 'Summarize Results (AI)';
        } else {
            const errorMsg = response?.error || chrome.runtime.lastError?.message || "Unknown error";
            console.error("Async Error:", errorMsg);
            if (container) {
                container.innerHTML = `<div style="color:red; font-weight:bold; padding:10px; border:1px solid red;">Error: ${errorMsg}</div>`;
            }
            btn.innerText = 'Error - Try Again';
            alert(`Summary Failed:\n${errorMsg}`);
        }

    } catch (err) {
        console.error("Content Script Send Error:", err);
        if (container) {
            container.innerHTML = `<div style="color:red">Error: ${err.message}</div>`;
        }
        btn.innerText = 'Error - Try Again';
        alert(`Request Failed:\n${err.message}`);
    } finally {
        btn.disabled = false;
    }
}

function formatSummary(text) {
    if (!text) return '';

    // Helper to escape HTML characters
    const escape = (str) => str.replace(/[&<>\n]/g, (tag) => {
        const chars = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\n': '<br>'
        };
        return chars[tag] || tag;
    });

    // Single pass replacement to ensure security
    // Matches **bold** content OR individual special characters
    // Using [\s\S] to match newlines within bold blocks
    return text.replace(/(\*\*([\s\S]*?)\*\*)|([&<>\n])/g, (match, boldBlock, boldContent, specialChar) => {
        if (boldBlock) {
            // If it's a bold block, escape the content and wrap in <b>
            return `<b>${escape(boldContent)}</b>`;
        }
        // If it's a special char outside bold, just escape it
        return escape(match);
    });
}

// Run logic
if (isSearxngPage()) {
    injectUI();
}

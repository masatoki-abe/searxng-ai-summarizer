// SearXNGページ・要素判定
function isSearxngPage() {
    // 一般的なSearXNGのセレクタ
    const hasResultList = document.getElementById('urls') || document.getElementById('results') || document.querySelector('.result-list');
    const hasSearchInput = document.querySelector('input[name="q"]');
    // 結果リストと検索ボックスの存在で判定する
    return !!(hasResultList && hasSearchInput);
}

function getResultSnippets() {
    // 検索結果の取得を試みる
    const results = document.querySelectorAll('.result');
    if (!results.length) return null;

    let combinedText = "";
    // トークン制限を考慮し、トップ10件のみ対象とする
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

    // ラッパー要素を作成
    const wrapper = document.createElement('div');
    wrapper.id = 'searxng-ai-wrapper';
    wrapper.className = 'searxng-ai-wrapper';

    // コントロールコンテナを作成
    const controls = document.createElement('div');
    controls.className = 'ai-summary-controls';

    // ボタンを作成
    const btn = document.createElement('button');
    btn.id = 'searxng-ai-summary-btn';
    btn.className = 'ai-summary-btn';
    btn.innerText = '✨ AIで要約を実行';
    btn.onclick = handleSummarizeClick;
    btn.style.marginBottom = '0';

    // 設定ボタンを作成
    const configBtn = document.createElement('button');
    configBtn.className = 'ai-config-btn';
    configBtn.innerHTML = '⚙️';
    configBtn.title = '設定を開く';
    configBtn.onclick = () => {
        browser.runtime.sendMessage({ action: 'open_options' });
    };

    controls.appendChild(btn);
    controls.appendChild(configBtn);

    // 要約表示コンテナを作成（初期状態は非表示）
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'searxng-ai-summary-container';
    summaryContainer.style.display = 'none';

    // ラッパーに追加
    wrapper.appendChild(controls);
    wrapper.appendChild(summaryContainer);

    // 検索結果の前に追加

    resultsContainer.parentNode.insertBefore(wrapper, resultsContainer);
}

async function handleSummarizeClick(e) {
    const btn = e.target;
    // ラッパー内のコンテナを使用する
    const container = document.getElementById('searxng-ai-summary-container');
    const snippets = getResultSnippets();

    if (!snippets) {
        alert("要約対象の検索結果が見つかりません。");
        return;
    }

    btn.disabled = true;
    btn.innerText = '要約を生成中...';

    // コンテナを表示する

    if (container) {
        container.style.display = 'block';
        container.innerHTML = '<div class="ai-spinner"></div>';
    }

    try {
        console.log("Sending request to background...");
        // レスポンスを待機する
        const response = await browser.runtime.sendMessage({
            action: 'summarize',
            text: snippets
        });

        console.log("Received response from background:", response);

        if (response && response.success) {
            console.log("Success! Updating UI...");

            // 安全のため再取得する
            const currentContainer = document.getElementById('searxng-ai-summary-container');

            if (currentContainer) {
                currentContainer.style.display = 'block';
                currentContainer.innerHTML = `
                  <div class="ai-summary-header">
                     <span class="ai-summary-title">✨ AI要約結果</span>
                  </div>
                  <div class="ai-summary-content">${formatSummary(response.data)}</div>
                `;
            } else {
                console.error("Summary container missing.");
                alert("エラー: AI要約結果の表示領域が見つかりません。");
            }

            btn.innerText = 'AIで要約を実行';
        } else {
            const errorMsg = response?.error || browser.runtime.lastError?.message || "不明なエラーが発生しました";
            console.error("Async Error:", errorMsg);
            if (container) {
                container.innerHTML = `<div style="color:red; font-weight:bold; padding:10px; border:1px solid red;">エラー: ${errorMsg}</div>`;
            }
            btn.innerText = 'エラー - 再試行';
            alert(`要約に失敗しました:\n${errorMsg}`);
        }

    } catch (err) {
        console.error("Content Script Send Error:", err);
        if (container) {
            container.innerHTML = `<div style="color:red">エラー: ${err.message}</div>`;
        }
        btn.innerText = 'エラー - 再試行';
        alert(`リクエストに失敗しました:\n${err.message}`);
    } finally {
        btn.disabled = false;
    }
}

function formatSummary(text) {
    if (!text) return '';

    // HTML文字をエスケープするヘルパー関数
    const escape = (str) => str.replace(/[&<>\n]/g, (tag) => {
        const chars = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\n': '<br>'
        };
        return chars[tag] || tag;
    });

    // 安全性を確保するため、1パスで置換を行う
    // **太字** コンテンツ または 個別の特殊文字にマッチさせる
    // [\s\S] を使用して、太字ブロック内の改行にもマッチさせる
    return text.replace(/(\*\*([\s\S]*?)\*\*)|([&<>\n])/g, (match, boldBlock, boldContent, specialChar) => {
        if (boldBlock) {
            // 太字ブロックの場合、中身をエスケープして <b> で囲む
            return `<b>${escape(boldContent)}</b>`;
        }
        // 太字以外の特殊文字はそのままエスケープする
        return escape(match);
    });
}

// 実行ロジック
if (isSearxngPage()) {
    injectUI();
}

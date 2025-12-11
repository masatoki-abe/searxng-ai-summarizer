document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openSettings').addEventListener('click', () => {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else {
            try {
                const win = window.open(browser.runtime.getURL('options/options.html'));
                if (!win) {
                    alert('ポップアップブロッカーにより設定ページを開けませんでした。ブロッカーを無効にしてください。');
                }
            } catch (e) {
                alert('設定ページの表示中にエラーが発生しました: ' + e);
            }
        }
    });
});

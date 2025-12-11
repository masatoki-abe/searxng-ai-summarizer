document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // 保存された設定を読み込む
    browser.storage.local.get(['apiKey', 'model']).then((items) => {
        if (items.apiKey) apiKeyInput.value = items.apiKey;
        if (items.model) modelInput.value = items.model;

        if (!modelInput.value) {
            modelInput.placeholder = 'gemini-2.5-flash-lite';
        }
    });

    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim();

        if (!apiKey) {
            statusDiv.textContent = 'APIキーを入力してください。';
            statusDiv.style.color = '#ff4d4f';
            return;
        }

        browser.storage.local.set({
            apiKey,
            model
        }).then(() => {
            statusDiv.textContent = '設定を保存しました！';
            statusDiv.style.color = '#52c41a';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});

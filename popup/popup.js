document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved settings
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
            statusDiv.style.color = 'red';
            return;
        }

        browser.storage.local.set({
            apiKey,
            model
        }).then(() => {
            statusDiv.textContent = '設定を保存しました！';
            statusDiv.style.color = '#333'; // Reset color or use success color
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});

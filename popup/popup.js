document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelInput = document.getElementById('model');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.local.get(['apiKey', 'model'], (items) => {
        if (items.apiKey) apiKeyInput.value = items.apiKey;
        if (items.model) modelInput.value = items.model;

        if (!modelInput.value) {
            modelInput.placeholder = 'gemini-2.5-flash-lite';
        }
    });

    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim();

        chrome.storage.local.set({
            apiKey,
            model
        }, () => {
            statusDiv.textContent = 'Settings saved!';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openSettings').addEventListener('click', () => {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else {
            window.open(browser.runtime.getURL('options/options.html'));
        }
    });
});

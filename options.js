document.getElementById('save').addEventListener('click', function() {
        localStorage.setItem('bypassRules', document.getElementById('bypass-rules').value);
        localStorage.setItem('adblockRules', document.getElementById('adblock-rules').value);
        localStorage.setItem('disableTimeout', parseInt(document.getElementById('disable-timeout').value) * 1000);
        chrome.extension.getBackgroundPage().reloadProxy();
        document.getElementById('status').style.display = 'block';
        setTimeout(function() {
                document.getElementById('status').style.display = '';
        }, 1000);
});
document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('bypass-rules').value = localStorage.getItem('bypassRules') || chrome.extension.getBackgroundPage().defaultBypassRules;
        document.getElementById('adblock-rules').value = localStorage.getItem('adblockRules') || chrome.extension.getBackgroundPage().defaultAdblockRules;
        document.getElementById('disable-timeout').value = parseInt(localStorage.getItem('disableTimeout') || chrome.extension.getBackgroundPage().defaultDisableTimeout) / 1000;
});
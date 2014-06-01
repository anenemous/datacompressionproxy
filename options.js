document.getElementById('save').addEventListener('click', function() {
        localStorage.setItem('bypassRules', document.getElementById('bypass-rules').value);
        localStorage.setItem('adblockRules', document.getElementById('adblock-rules').value);
        chrome.extension.getBackgroundPage().reloadProxy();
        document.getElementById('status').style.display = 'block';
        setTimeout(function() {
                document.getElementById('status').style.display = '';
        }, 1000);
});
document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('bypass-rules').value = localStorage.getItem('bypassRules') || chrome.extension.getBackgroundPage().defaultBypassRules;
        document.getElementById('adblock-rules').value = localStorage.getItem('adblockRules') || chrome.extension.getBackgroundPage().defaultAdblockRules;
});

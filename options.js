document.getElementById('save').addEventListener('click', function() {
        localStorage.setItem('bypassRules', document.getElementById('bypass-rules').value);
        localStorage.setItem('adblockRules', document.getElementById('adblock-rules').value);
        document.getElementById('disable-timeout').value = parseInt(document.getElementById('disable-timeout').value) || (0).toString();
        localStorage.setItem('disableTimeout', document.getElementById('disable-timeout').value);
        chrome.extension.getBackgroundPage().timeout = document.getElementById('disable-timeout').value * 1000;
        chrome.extension.getBackgroundPage().reloadProxy();
        document.getElementById('status').style.display = 'block';
        setTimeout(function() {
                document.getElementById('status').style.display = '';
        }, 1000);
});
document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('bypass-rules').value = localStorage.getItem('bypassRules') || chrome.extension.getBackgroundPage().defaultBypassRules;
        document.getElementById('adblock-rules').value = localStorage.getItem('adblockRules') || chrome.extension.getBackgroundPage().defaultAdblockRules;
        document.getElementById('disable-timeout').value = localStorage.getItem('disableTimeout') || chrome.extension.getBackgroundPage().defaultDisableTimeout;
        document.getElementById('disable-timeout').onkeydown = function(event) {
            if (event.keyCode == 8)
                return true;
            if (document.getElementById('disable-timeout').value.length >= 4)
                return false;
            return event.keyCode == 8 || event.keyCode >= '0'.charCodeAt(0) && event.keyCode <= '9'.charCodeAt(0);
        };
});
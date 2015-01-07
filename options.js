/**
 * Data Compression Proxy Extension for Google Chrome on Desktop
 * (c) 2014 Jerzy Głowacki. License: Apache 2.0
 */

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

	document.getElementById('session-mbytes').innerText = Math.round(chrome.extension.getBackgroundPage().sessionBytes / 1048576); //MB
	document.getElementById('session-mbytes-original').innerText =  Math.round(chrome.extension.getBackgroundPage().sessionOriginalBytes / 1048576); //MB
	document.getElementById('session-percent').innerText =  Math.round(100 - 100 * chrome.extension.getBackgroundPage().sessionBytes / chrome.extension.getBackgroundPage().sessionOriginalBytes); //%

	var totalBytes = JSON.parse(localStorage.getItem('totalBytes')) || {};
	var totalBytesSent = Object.keys(totalBytes).reduce(function(i, j) { return i + totalBytes[j][0]; }, 0);
	var totalBytesOriginal = Object.keys(totalBytes).reduce(function(i, j) { return i + totalBytes[j][1]; }, 0);

	document.getElementById('total-mbytes').innerText = Math.round(totalBytesSent / 1048576); //MB
	document.getElementById('total-mbytes-original').innerText =  Math.round(totalBytesOriginal / 1048576); //MB
	document.getElementById('total-percent').innerText =  Math.round(100 - 100 * totalBytesSent / totalBytesOriginal); //%

	if(Object.keys(totalBytes).length) {
		var cumulativeBytesSent = Object.keys(totalBytes).reduce(function(i, j) { i.push((i.length && i[i.length-1] || 0) + Math.round(totalBytes[j][0] / 1048576)); return i; }, []);
		var cumulativeBytesOriginal = Object.keys(totalBytes).reduce(function(i, j) { i.push((i.length && i[i.length-1] || 0) + Math.round(totalBytes[j][1] / 1048576)); return i; }, []);
		new Chartist.Line('.ct-chart', {labels: Object.keys(totalBytes), series: [cumulativeBytesSent, cumulativeBytesOriginal]}, {showArea: true});
	}
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-200051-16']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
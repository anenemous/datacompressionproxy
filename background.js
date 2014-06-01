/**
 * Data Compression Proxy Extension for Google Chrome on Desktop
 * (c) 2014 Jerzy Głowacki. License: Apache 2.0
 */

var authHeader = {
	name: 'Proxy-Authorization',
	value: 'SpdyProxy ps="1390372720-748089166-1671804897-22716992", sid="95b3da26c6bfc85b64b4768b7e683000"'
};

//TODO: ps = function(timestamp) { return timestamp + '-' + rand() + '-' + rand() + '-' + rand(); }
//TODO: sid = function(timestamp) { return md5(timestamp + SPDY_PROXY_AUTH_VALUE + timestamp); }

var defaultBypassRules = "<local>\n10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16\nfc00::/7\n*-ds.metric.gstatic.com\n*-v4.metric.gstatic.com";

var defaultAdblockRules = "*://*.googlesyndication.com/*\n*://*.googleadservices.com/*\n*://*.doubleclick.net/*\n*://*.intellitxt.com/*\n*://*.tradedoubler.com/*\n*://*.chitika.net/*\n*://*.amazon-adsystem.com/*\n*://*.ads.yahoo.com/*";

var bypassList = (localStorage.getItem('bypassRules') || defaultBypassRules).split('\n').filter(function(e) { return e });

var adblockList = (localStorage.getItem('adblockRules') || defaultAdblockRules).split('\n').filter(function(e) { return e });

var setProxy = function() {
	chrome.proxy.settings.set({
		value: {
			mode: "fixed_servers",
			rules: {
				proxyForHttp: {
					scheme: "https",
					host: "proxy.googlezip.net"
				},
				bypassList: bypassList
			}
		},
		scope: 'regular'
	});
	if(chrome.declarativeWebRequest) {
		//Chrome Beta/Dev
		chrome.declarativeWebRequest.onRequest.addRules([
			//Block ads
			{
				conditions: adblockList.map(function(url) {
					return new chrome.declarativeWebRequest.RequestMatcher({
						url: {hostContains: url.replace(/https?:|:|\/|\*/gi, '')},
						stages: ['onBeforeRequest']
					});
				}),
				actions: [
					new chrome.declarativeWebRequest.CancelRequest()
				]
			},
			//Add auth header
			{
				conditions: [
					new chrome.declarativeWebRequest.RequestMatcher({
						url: {schemes: ['http']},
						stages: ['onBeforeSendHeaders']
					})
				],
				actions: [
					new chrome.declarativeWebRequest.SetRequestHeader(authHeader)
				]
			},
			//Get response on error
			{
				conditions: [
					new chrome.declarativeWebRequest.RequestMatcher({
						responseHeaders: [{nameEquals: 'status', valuePrefix: '50'}],
						stages: ['onHeadersReceived']
					})
				],
				actions: [
					new chrome.declarativeWebRequest.SendMessageToExtension({message: 'bypass'})
				]
			}
		]);
		//Handle response
		chrome.declarativeWebRequest.onMessage.addListener(onResponse);
	} else {
		//Chrome Stable
		//Block ads
		chrome.webRequest.onBeforeRequest.addListener(
			onCancel,
			{urls: adblockList},
			["blocking"]
		);
		//Add auth header
		chrome.webRequest.onBeforeSendHeaders.addListener(
			onAddAuthHeader,
			{urls: ["http://*/*"]},
			["requestHeaders", "blocking"]
		);
		//Get response on error
		chrome.webRequest.onHeadersReceived.addListener(
			onResponse,
			{urls: ["http://*/*"]}
		);
	}
	localStorage.setItem('isSetProxy', 1);
	chrome.browserAction.setIcon({path: 'on.png'});
	chrome.browserAction.setTitle({title: 'Data Compression Proxy: Enabled'});
};

var unsetProxy = function() {
	chrome.proxy.settings.set({
		value: {mode: 'system'},
		scope: 'regular'
	});
	if(chrome.declarativeWebRequest) {
		//Chrome Beta/Dev
		chrome.declarativeWebRequest.onRequest.removeRules();
		chrome.declarativeWebRequest.onMessage.removeListener(onResponse);
	} else {
		//Chrome Stable
		chrome.webRequest.onBeforeRequest.removeListener(onCancel);
		chrome.webRequest.onBeforeSendHeaders.removeListener(onAddAuthHeader);
		chrome.webRequest.onHeadersReceived.removeListener(onResponse);
	}
	localStorage.setItem('isSetProxy', 0);
	chrome.browserAction.setIcon({path: 'off.png'});
	chrome.browserAction.setTitle({title: 'Data Compression Proxy: Disabled'});
};

var reloadProxy = function() {
	unsetProxy();
	bypassList = (localStorage.getItem('bypassRules') || defaultBypassRules).split('\n').filter(function(e) { return e; });
	adblockList = (localStorage.getItem('adblockRules') || defaultAdblockRules).split('\n').filter(function(e) { return e; });
	setProxy();
};

var onCancel = function(details) {
	return {cancel: true};
};

var onAddAuthHeader = function(details) {
	details.requestHeaders.push(authHeader);
	return {requestHeaders: details.requestHeaders};
};

var onResponse = function(response) {
	//Bypass proxy on error for 30s
	if(response.message == 'bypass' || response.statusLine && response.statusLine.indexOf('50') > -1) {
		unsetProxy();
		setTimeout(setProxy, 30000);
	}
};

chrome.browserAction.onClicked.addListener(function() {
	//Toggle proxy on button clicked
	localStorage.getItem('isSetProxy') == 1 ? unsetProxy() : setProxy();
});

if(localStorage.getItem('isSetProxy') == 1) {
	setProxy();
}
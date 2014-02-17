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

var isSetProxy = false;

var setProxy = function() {
	if(isSetProxy)
		return;
	chrome.proxy.settings.set({
		value: {
			mode: "fixed_servers",
			rules: {
				proxyForHttp: {
					scheme: "https",
					host: "proxy.googlezip.net"
				},
				bypassList: [
					"<local>",
					"10.0.0.0/8",
					"172.16.0.0/12",
					"192.168.0.0/16",
					"fc00::/7",
					"*-ds.metric.gstatic.com",
					"*-v4.metric.gstatic.com"
				]
			}
		},
		scope: 'regular'
	});
	isSetProxy = true;
	chrome.browserAction.setIcon({path: 'on.png'});
	chrome.browserAction.setTitle({title: 'Data Compression Proxy: Enabled'});
};

var unsetProxy = function() {
	if(!isSetProxy)
		return;
	chrome.proxy.settings.set({
		value: {mode: 'system'},
		scope: 'regular'
	});
	isSetProxy = false;
	chrome.browserAction.setIcon({path: 'off.png'});
	chrome.browserAction.setTitle({title: 'Data Compression Proxy: Disabled'});
};

var onResponse = function(response) {
	//Bypass proxy on error for 30s
	if(response.message == 'bypass' || response.statusLine && response.statusLine.indexOf('502') > -1) {
		unsetProxy();
		setTimeout(setProxy, 30000);
	}
};

if(chrome.declarativeWebRequest) {

	//Chrome Beta/Dev
	console.log('Using declarativeWebRequest');
	chrome.declarativeWebRequest.onRequest.addRules([
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
					responseHeaders: [{nameEquals: 'chrome-proxy', valuePrefix: 'bypass'}],
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
	console.log('Using webRequest');
	//Add auth header
	chrome.webRequest.onBeforeSendHeaders.addListener(
		function(details) {
			details.requestHeaders.push(authHeader);
			return {requestHeaders: details.requestHeaders};
		},
		{urls: ["http://*/*"]},
		["requestHeaders", "blocking"]
	);
	//Get response on error
	chrome.webRequest.onHeadersReceived.addListener(
		onResponse,
		{urls: ["http://*/*"]}
	);
}

chrome.browserAction.onClicked.addListener(function() {
	isSetProxy ? unsetProxy() : setProxy();
});

setProxy();

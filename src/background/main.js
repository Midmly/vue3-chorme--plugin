import hotReload from '@/utils/hotReload';
hotReload()

// 接收inject传来的信息，转发给content.js
// chrome.runtime.onMessage.addListener(msg => {
//     if (msg.type === 'ajaxInject-backend') {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//             chrome.tabs.sendMessage(tabs[0].id, { type:'ajaxInject-content', from:'backend',data: 'reload debugger' });
//         })
//     }
// });


// chrome.webRequest.onBeforeRequest.addListener(
//     function(details) {
//         // 在此处处理请求
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//             chrome.tabs.sendMessage(tabs[0].id, { type:'webRequest-details', from:'onBeforeRequest', data: details });
//         })
//     },
//     {urls: ["<all_urls>"]},
//     ["blocking"]
// );
//
chrome.webRequest.onCompleted.addListener(
    function(details) {
        // 在此处处理响应
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, { type:'webRequest-details', from:'onCompleted', data: details });
        })
    },
    {urls: ["<all_urls>"]}
);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        // 提取标签页URL中的域名部分
        const domain = (new URL(tab.url)).hostname;
        chrome.storage.local.get(['DebugTabs'], function(result) {
            if (Array.isArray(result.DebugTabs)) {
                chrome.browserAction.setBadgeBackgroundColor({ color: '#7ff6a9' });
                if (result.DebugTabs.includes(domain)) {
                    chrome.browserAction.setBadgeText({ text: 'on' });
                } else {
                    chrome.browserAction.setBadgeText({ text: 'off' });
                }
            }
        });
    });
});

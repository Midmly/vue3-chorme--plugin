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
//             chrome.tabs.sendMessage(tabs[0].id, { type:'ajaxInject-content', from:'onBeforeRequest', data: details });
//         })
//     },
//     {urls: ["<all_urls>"]},
//     ["blocking"]
// );
//
// chrome.webRequest.onCompleted.addListener(
//     function(details) {
//         // 在此处处理响应
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//             chrome.tabs.sendMessage(tabs[0].id, { type:'ajaxInject-content', from:'onCompleted', data: details });
//         })
//     },
//     {urls: ["<all_urls>"]}
// );

let currentTab_id = null;

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        // 提取标签页URL中的域名部分
        const domain = (new URL(tab.url)).hostname;
        chrome.storage.local.get(['DebugTabs'], function(result) {
            if (Array.isArray(result.DebugTabs)) {
                if (result.DebugTabs.includes(domain)) {
                    // chrome.tabs.sendMessage(activeInfo.tabId, { type:'ajaxInject-content', from:'onTabChange', data: tab});
                    if (currentTab_id !== activeInfo.tabId) {
                        chrome.debugger.detach({tabId: currentTab_id})
                        Attach(activeInfo.tabId)
                    }
                }
            }
        });
    });
    return
    // eslint-disable-next-line no-unreachable
    if (currentTab_id !== activeInfo.tabId) {
        chrome.debugger.detach({tabId: currentTab_id})
        Attach(activeInfo.tabId)
    }
//将当前页面Attach到调试器
    function Attach(id) {
        chrome.debugger.attach({
            tabId: id
        }, "1.3", onAttach.bind(null, id));
    }
//Attach成功后,开启网络并禁止缓存
    function onAttach(tabId) {
        currentTab_id = tabId
        chrome.debugger.sendCommand({ //first enable the Network
            tabId: tabId
        }, "Network.enable",function(){
            chrome.debugger.sendCommand(
                { tabId: tabId},
                "Network.setCacheDisabled",{cacheDisabled:true},
                function(){
                    console.log("cache disabled!")
                }
            )
        });
        chrome.debugger.onEvent.addListener(allEventHandler);
    }

    //接受Debugger的Events
    function allEventHandler(debuggeeId, message, params){
        if (currentTab_id !== debuggeeId.tabId) {
            return;
        }
        // chrome.tabs.sendMessage(currentTab_id,
        //     { type:'ajaxInject-content', from:'Events-inject', data: {debug: debuggeeId,msg:  message,parm: params}});
        if (message === "Network.responseReceived") {
            console.log("responseReceived")
            chrome.debugger.sendCommand({
                tabId: debuggeeId.tabId
            }, "Network.getResponseBody", {
                "requestId": params.requestId
            }, function(response) {
                // console.log(response)
                chrome.tabs.sendMessage(currentTab_id, { type:'ajaxInject-content',
                    from:'response-inject',
                    data: {
                    resp: response, params: params
                }});
                //response就是接受到的ResponseBody,可以通过RequstId来判断是哪个Request的Response
            });
        }

    }

});

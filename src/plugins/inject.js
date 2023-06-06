const dbName = 'requestDatabase-'+window.location.hostname;
// eslint-disable-next-line no-undef,no-unused-vars
const db = new Dexie(dbName);
db.version(1).stores({
    requests: '++id, url, addr, method, status, type, requestTime, responseTime, requestHeaders, responseHeaders, responseData'
});
// 打开数据库
// 将 requests 实例注册为全局变量
window.requestTable = db.table('requests');


// eslint-disable-next-line no-unused-vars,no-unexpected-multiline
(function (xhr) {
    const XHR = XMLHttpRequest.prototype;

    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };
    const startTime = Date.now();
    XHR.send = function () {
        this.addEventListener('load', function () {
            const endTime = Date.now();
            const respHeaders = {}
            for (let key of this.getAllResponseHeaders().split('\r\n')) {
                const tmp = key.split(':')
                if (tmp.length === 2){
                    respHeaders[tmp[0].trim()] = tmp[1].trim();
                }
            }
            const requestData = {
                method: this._method,
                url: getFullURL(this._url),
                addr: '0.0.0.0',
                status: this.status,
                type: 'xhr',
                requestTime: startTime,
                responseTime: endTime,
                responseHeaders: respHeaders,
                responseData: this.response
            };
            // 保存请求和响应数据到 Dexie 数据库
            window.requestTable.add(requestData);
            console.log('set xhr data to db success!')
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);


const { fetch: origFetch } = window;
window.fetch = async (url, options) => {
    const startTime = Date.now();
    const response = await origFetch(url, options);
    const respClone = response.clone();
    respClone.blob() // maybe json(), text(), blob()
        .then(data => {
            const endTime = Date.now();
            const respHeaders = {}
            for (let [key, value] of respClone.headers) {
                respHeaders[key] = value;
            }
            if (data.type.includes('application/json')) {
                (new Response(data)).json().then(resp=>{
                    const requestData = {
                        method: options?.method,
                        url: getFullURL(url),
                        addr: '0.0.0.0',
                        status: respClone.status,
                        type: 'fetch',
                        requestTime: startTime,
                        responseTime: endTime,
                        requestHeaders: options?.headers,
                        responseHeaders: respHeaders,
                        responseData: resp
                    };
                    // 保存请求和响应数据到 Dexie 数据库
                    window.requestTable.add(requestData);
                    console.log('set fetch data to db success!')
                }).catch(err => {
                    console.log(err.toString())
                });
            } else if (data.type.includes('text/plain')) {
                (new Response(data)).text().then(resp=>{
                    const requestData = {
                        method: options?.method,
                        url: getFullURL(url),
                        addr: '0.0.0.0',
                        status: respClone.status,
                        type: 'fetch',
                        requestTime: startTime,
                        responseTime: endTime,
                        requestHeaders: options?.headers,
                        responseHeaders: respHeaders,
                        responseData: resp
                    };
                    // // 保存请求和响应数据到 Dexie 数据库
                    window.requestTable.add(requestData);
                    console.log('set fetch data to db success!')
                }).catch(err => {
                    console.log(err.toString())
                });
            } else {
                const requestData = {
                    method: options?.method,
                    url: getFullURL(url),
                    addr: '0.0.0.0',
                    status: respClone.status,
                    type: 'fetch',
                    requestTime: startTime,
                    responseTime: endTime,
                    requestHeaders: options?.headers,
                    responseHeaders: respHeaders,
                    responseData: URL.createObjectURL(data)
                };
                // // 保存请求和响应数据到 Dexie 数据库
                window.requestTable.add(requestData);
                console.log('set fetch data to db success!')
            }
        }).catch(err => {
        console.log(err.toString())
    });

    return response;
};

function getFullURL(url) {
    try {
        const parsedUrl = new URL(url);
        return url
    } catch (error) {
        return window.location.origin + url;
    }
}

console.log('this is inject')

const dbName = window.location.hostname;
console.log(dbName);
// eslint-disable-next-line no-undef,no-unused-vars
const db = new Dexie(dbName);
db.version(1).stores({
    requests: '++id, url, method, status, type, requestTime, responseTime, requestHeaders, responseHeaders, responseData'
});
// 打开数据库
// db.open().then(() => {
//     console.log('Database opened successfully');
// }).catch(error => {
//     console.error('Failed to open database:', error);
// });

// 将table requests 实例导出
// const RequestDatabase =

// 将 requests 实例注册为全局变量
window.requestDatabase = db.table('requests');

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
    // XHR.send = function (postData) {
    XHR.send = function () {
        this.addEventListener('load', function () {
            const endTime = Date.now();
            const requestData = {
                method: this._method,
                url: this._url,
                status: this.status,
                type: 'xhr',
                requestTime: startTime,
                responseTime: endTime,
                responseHeaders: this.getAllResponseHeaders(),
                responseData: this.response
            };
            // 保存请求和响应数据到 Dexie 数据库
            window.requestDatabase.add(requestData);
            console.log('set data to db success!')
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);


const { fetch: origFetch } = window;
window.fetch = async (url, options) => {
    const startTime = Date.now();
    const response = await origFetch(url, options);

    const respClone = response.clone();
    cloneFetchResponse(response).then();
    respClone.blob() // maybe json(), text(), blob()
        .then(data => {
            const endTime = Date.now();
            if (data.type.includes('application/json')) {
                (new Response(data)).json().then(resp=>{
                    console.log(response.status)
                    const requestData = {
                        method: options.method,
                        url: url,
                        status: response.status,
                        type: 'fetch',
                        requestTime: startTime,
                        responseTime: endTime,
                        requestHeaders: options.headers,
                        responseHeaders: response.headers,
                        responseData: resp
                    };
                    // 保存请求和响应数据到 Dexie 数据库
                    window.requestDatabase.add(requestData);
                    console.log('set data to db success!')
                }).catch(err => {
                    console.error(err)
                });
            } else if (data.type.includes('text/plain')) {
                (new Response(data)).text().then(resp=>{
                    console.log(resp)
                    // const requestData = {
                    //     method: this._method,
                    //     url: this._url,
                    //     status: this.status,
                    //     type: 'fetch',
                    //     requestTime: startTime,
                    //     responseTime: endTime,
                    //     responseHeaders: this.getAllResponseHeaders(),
                    //     responseData: resp
                    // };
                    // console.log(this.response)
                    // // 保存请求和响应数据到 Dexie 数据库
                    // window.requestDatabase.add(requestData);
                    // console.log('set data to db success!')
                }).catch(err => {
                    console.error(err)
                });
            } else {
                // const requestData = {
                //     method: this._method,
                //     url: this._url,
                //     status: this.status,
                //     type: 'fetch',
                //     requestTime: startTime,
                //     responseTime: endTime,
                //     responseHeaders: this.getAllResponseHeaders(),
                //     responseData: URL.createObjectURL(data)
                // };
                // console.log(this.response)
                // // 保存请求和响应数据到 Dexie 数据库
                // window.requestDatabase.add(requestData);
                // console.log('set data to db success!')
            }
        }).catch(err => console.error(err));

    return response;
};

// eslint-disable-next-line no-unused-vars
async function cloneFetchResponse(response) {
  console.log(response)
}

console.log('this is inject')
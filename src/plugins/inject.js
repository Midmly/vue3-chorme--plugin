const dbName = window.location.hostname;
console.log(dbName);
// eslint-disable-next-line no-undef,no-unused-vars
const db = new Dexie(dbName);
db.version(1).stores({
    users: "++id, name, age, emial",
    students: "++id, &username",
    books: "id, author, name, *categories"
});
db.users.get(1).then(resp=>{
    console.log(resp)
})

//   db.users.add({
//     name: '张三',
//     age: 18,
//     email: 'xxxx@xx.com.cn'
//   })

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

    XHR.send = function (postData) {
        // console.log('injected script xhr request:', this._method, this._url, this.getAllResponseHeaders(), postData);
        this.addEventListener('load', function () {
            console.log({ type: 'xhr',
                request: {
                method: this._method,
                url: this._url,
                headers: this.getAllResponseHeaders(),
                body: postData
                },
                response: this.response })
            // window.postMessage({ type: 'xhr', data: this.response }, '*');  // send to content script
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);


const { fetch: origFetch } = window;
window.fetch = async (...args) => {
    const response = await origFetch(...args);
    // console.log('injected script fetch request:', args);
    response.clone().blob() // maybe json(), text(), blob()
        .then(data => {
            console.log(data.type)
            if (data.type.includes('application/json')) {
                (new Response(data)).json().then(resp=>{
                    console.log({ type: 'fetch',request: args, response: resp })
                }).catch(err => {
                    console.error(err)
                });
            } else if (data.type.includes('text/plain')) {
                (new Response(data)).text().then(resp=>{
                    console.log({ type: 'fetch',request: args, response: resp })
                }).catch(err => {
                    console.error(err)
                });
            } else {
                console.log({ type: 'fetch',request: args, response: URL.createObjectURL(data) })
            }
            // window.postMessage({ type: 'fetch', data: data }, '*'); // send to content script
            //window.postMessage({ type: 'fetch', data: URL.createObjectURL(data) }, '*'); // if a big media file, can createObjectURL before send to content script
        }).catch(err => console.error(err));

    return response;
};

console.log('this is inject')
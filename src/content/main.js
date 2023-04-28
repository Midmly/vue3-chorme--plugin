import { createApp } from 'vue'
import App from './components/app.vue'
import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// joinContent(app)
// injectJsInsert()
function joinContent (element) {
	const join = document.getElementById('joinContentApp')
	if (join === null){
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.href = '//unpkg.com/element-plus/dist/index.css'
		document.head.appendChild(link)
		const div = document.createElement('div')
		div.id = 'joinContentApp'
		div.style.zIndex = '4000'
		div.style.position = 'fixed'
		document.body.appendChild(div)
		div.ins
		const app = createApp(element)
		app.use(ElementPlus)
		app.mount('#joinContentApp')
		InsertScript()
	}
}
//chrome的API接口,用于传输或监听数据信号
chrome.extension.onRequest.addListener(
  function (request) {
    if (request.popAction === "Test") {
			console.log("test")
		joinContent(App)
    }
  }
);
// function injectJsInsert () {
// 	document.addEventListener('readystatechange', () => {
// 		// append content js
// 		const contentPath = 'js/content.js'
// 		const contentScript = document.createElement('script')
// 		contentScript.setAttribute('type', 'text/javascript')
// 		contentScript.src = chrome.extension.getURL(contentPath)
// 		document.body.appendChild(contentScript)
// 		// append inject js
// 		const injectPath = 'js/inject.js'
// 		const injectScript = document.createElement('script')
// 		injectScript.setAttribute('type', 'text/javascript')
// 		injectScript.src = chrome.extension.getURL(injectPath)
// 		document.body.appendChild(injectScript)
// 	})
// }
function InsertScript(){
	// append content js
	// const contentPath = 'js/content.js'
	// const contentScript = document.createElement('script')
	// contentScript.setAttribute('type', 'text/javascript')
	// contentScript.src = chrome.extension.getURL(contentPath)
	// document.head.appendChild(contentScript)
	// append inject js
	const injectPath = 'js/inject.js'
	const injectScript = document.createElement('script')
	injectScript.setAttribute('type', 'text/javascript')
	injectScript.src = chrome.extension.getURL(injectPath)
	document.body.appendChild(injectScript)
}

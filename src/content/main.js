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
		// div.ins
		const app = createApp(element)
		app.use(ElementPlus)
		app.mount('#joinContentApp')
		InsertSourceScript('js/inject.js')
		InsertOtherScript('//cdnjs.cloudflare.com/ajax/libs/html2canvas/1.3.2/html2canvas.min.js')
	}
}
//chrome的API接口,用于传输或监听数据信号
chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.cmd === "ContentInitFun") {
		joinContent(App)
    }
  }
);

function InsertOtherScript(path){
	const otherScript = document.createElement('script')
	otherScript.setAttribute('type', 'text/javascript')
	otherScript.src = path
	document.body.appendChild(otherScript)
}

function InsertSourceScript(path){
	const sourceScript = document.createElement('script')
	sourceScript.setAttribute('type', 'text/javascript')
	sourceScript.src = chrome.extension.getURL(path)
	document.body.appendChild(sourceScript)
}

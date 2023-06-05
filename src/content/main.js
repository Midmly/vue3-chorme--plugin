import { createApp } from 'vue';
import App from './components/app.vue';
import ElementPlus from 'element-plus';
insertSourceScriptToHead('js/dexie.js');
initContent();

function initContent () {
		let url = window.location.hostname
		chrome.storage.local.get(['DebugTabs'], function(result) {
			if (Array.isArray(result.DebugTabs)) {
				if (result.DebugTabs.includes(url)) {
					joinContent(App);
				}
			} else {
				chrome.storage.local.set({DebugTabs: []}, function() {
					console.log('Data init');
				});
			}
		});
}

function joinContent (element) {
	const join = document.getElementById('joinContentApp')
	if (join === null){
		insertSourceScriptToHead('js/inject.js');
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
		InsertOtherScript('//cdnjs.cloudflare.com/ajax/libs/html2canvas/1.3.2/html2canvas.min.js')
	}
}

//chrome的API接口,用于传输或监听数据信号
chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.cmd === "ContentInitFun") {
		joinContent(App)
		chrome.runtime.sendMessage(chrome.runtime.id, {type: 'ajaxInject-backend', to: 'background'});
    }
  }
);

function InsertOtherScript(path){
	const otherScript = document.createElement('script')
	otherScript.setAttribute('type', 'text/javascript')
	otherScript.src = path
	document.body.appendChild(otherScript)
}

// eslint-disable-next-line no-unused-vars,no-unexpected-multiline
function insertSourceScriptToHead(path){
	// 获取 body 元素
	const headElement = document.head;
	// 获取第一个子元素
	const firstChild = headElement.firstChild;
	const sourceScript = document.createElement('script')
	sourceScript.setAttribute('type', 'text/javascript')
	sourceScript.src = chrome.extension.getURL(path)
	// document.body.appendChild(sourceScript)
	// 在第一个子元素之前插入新元素
	headElement.insertBefore(sourceScript, firstChild);
}

// // 接收background.js传来的信息
chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'Close-delete-DB') {
		const dbName = 'requestDatabase-'+window.location.hostname;
		const request = window.indexedDB.open(dbName);
		request.onsuccess = function(event) {
			const db = event.target.result;
			// 关闭数据库连接
			db.close();
			// 在成功打开数据库后进行删除操作
			deleteDatabase(dbName);
		};
	}
});
function deleteDatabase(dbName) {
	// 删除数据库
	const deleteRequest = window.indexedDB.deleteDatabase(dbName);
	deleteRequest.onsuccess = function(event) {
		console.log('IndexedDB database deleted successfully',event);
	};
	deleteRequest.onerror = function(event) {
		console.error('Failed to delete IndexedDB database',event);
	};
	deleteRequest.onblocked = function(event) {
		console.error('IndexedDB database deletion blocked',event);
	};
}

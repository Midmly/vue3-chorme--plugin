import { createApp } from 'vue';
import App from './components/app.vue';
import ElementPlus from 'element-plus';
import { Dexie } from "dexie";
insertSourceScriptToHead('js/dexie.js',true);
initContent();

function initContent () {
		let url = window.location.hostname
		chrome.storage.local.get(['DebugTabs'], function(result) {
			if (Array.isArray(result.DebugTabs)) {
				if (result.DebugTabs.includes(url)) {
					inject();
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
		insertSourceScriptToHead('js/inject.js',false);
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
  function (msg) {
    if (msg.cmd === "ContentInitFun") {
		joinContent(App)
    }else if (msg.type === 'Close-delete-DB') {
		const dbName = 'requestDatabase-'+window.location.hostname;
		const request = window.indexedDB.open(dbName);
		request.onsuccess = function(event) {
			const db = event.target.result;
			// 关闭数据库连接
			db.close();
			// 在成功打开数据库后进行删除操作
			deleteDatabase(dbName);
		};
	} else if (msg.type === 'webRequest-details') {
        // console.log(msg.data)
		try {
			const date = new Date(); // 获取当前时间
			// 减去 1 分钟
			date.setMinutes(date.getMinutes() - 3);
			// window.requestTable.where('url').startsWith(msg.data?.initiator).modify(record => {
			window.requestTable.where('url').equals(msg.data?.url)
				.and(record => record.requestTime >= date.getTime()).modify(record => {
				record.addr = msg.data?.ip;
			}).then(updatedCount => {
				console.log(`Updated ip on ${updatedCount} records.`);
			}).catch(error => {
				console.log(error.toString());
			});
		}catch (e) {
			console.log(e.toString());
		}
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
function insertSourceScriptToHead(path,async){
	// 获取 body 元素
	const headElement = document.head;
	// 获取第一个子元素
	const firstChild = headElement.firstChild;
	const sourceScript = document.createElement('script')
	sourceScript.setAttribute('type', 'text/javascript')
	sourceScript.src = chrome.extension.getURL(path);
	sourceScript.async = async;
	// document.body.appendChild(sourceScript)
	// 在第一个子元素之前插入新元素
	headElement.insertBefore(sourceScript, firstChild);
}

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

function inject(){
	const dbName = 'requestDatabase-'+window.location.hostname;
// eslint-disable-next-line no-undef,no-unused-vars
	const db = new Dexie(dbName);
	db.version(1).stores({
		requests: '++id, url, addr, method, status, type, requestTime, responseTime, requestHeaders, responseHeaders, responseData'
	});
// 打开数据库
// 将 requests 实例注册为全局变量
	window.requestTable = db.table('requests');
}

<template>
	<transition name="bounce">
		<div v-if="!visible">
			<div class="button-box" v-drag draggable="false">
				<el-button class="button-badge" circle v-on:dblclick="visible = !visible" />
				<div style="text-align: center">性能监视器(双击打开)</div>
			</div>
		</div>
	</transition>
	<transition name="bounce">
		<div v-if="visible" class="box-card-parent">
			<el-card
					class="box-card"
					:body-style="{ width: '100%', height: '88%', borderRadius: '1rem', padding: '10px' }"
			>
				<template #header>
<!--					<el-select-->
<!--							style="width: 10%"-->
<!--							v-model="selectedType"-->
<!--							placeholder="监测类型"-->
<!--					>-->
<!--						<el-option-->
<!--								v-for="item in selectTypeOptions"-->
<!--								:key="item.value"-->
<!--								:label="item.label"-->
<!--								:value="item.value"-->
<!--						/>-->
<!--					</el-select>-->
					<el-button type="primary" @click="getStaticMonitor">获取性能数据</el-button>
					<el-button style="margin-left: 1rem" :disabled="tableData.length===0" type="success" @click="downloadData">下载数据</el-button>
					<span style="margin-left: 1rem;">性能标注：</span>
					<span>
						<span class="color success_back"></span>
						<span class="success-row">{{ "<=50ms" }}</span>
					</span>
					<span>
						<span class="color warning_back"></span>
						<span class="warning-row">{{ "<=100ms" }}</span>
					</span>
					<span>
						<span class="color error_back"></span>
						<span class="error-row">{{ ">100ms" }}</span>
					</span>
					<span style="margin-left: 1rem;">总条数：{{ tableData.length }}</span>
					<el-button style="float: right" type="success" @click="closeCard"
					>隐藏页面</el-button
					>
				</template>
				<el-table
						:data="tableData"
						style="width: 100%; border-radius: 1rem"
						height="100%"
						:default-sort="{ prop: 'requestTime', order: 'descending' }"
						:row-style="tableRowStyle"
						border
						lazy
				>
					<el-table-column fixed prop="name" show-overflow-tooltip sortable resizable label="请求路径" width="350" />
					<el-table-column fixed prop="initiatorType" sortable resizable label="类型" width="auto" />
					<el-table-column fixed prop="lookupTime" sortable resizable label="域名解析ms" width="auto" />
					<el-table-column fixed prop="tcpTime" sortable resizable label="tcp建接ms" width="auto" />
					<el-table-column fixed prop="sslTime" sortable resizable label="ssl建接ms" width="auto" />
					<el-table-column fixed prop="requestTime" sortable resizable label="请求耗时ms" width="auto" />
					<el-table-column fixed prop="responseTime" sortable resizable label="响应耗时ms" width="auto" />
					<el-table-column fixed prop="transferSize" sortable resizable label="传输大小kb" width="auto" />
					<el-table-column fixed prop="firstByteTime" sortable resizable label="首包时间ms" width="auto" />
<!--					<el-table-column fixed prop="responseEnd" sortable resizable label="结束时间ms" width="auto" />-->
<!--					<el-table-column fixed prop="duration" sortable resizable label="消耗时间ms" width="auto" />-->
				</el-table>
			</el-card>
		</div>
	</transition>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
	data(){
		return {
			visible: true,
			selectTypeOptions: [
				{
					label: '资源',
					value: 'resource'
				},
				{
					label: '导航',
					value: 'navigation'
				},
				{
					label: '框架',
					value: 'frame'
				},
				{
					label: '耗时任务',
					value: 'longtask'
				}
			],
			selectedType: 'resource',
			tableData: []
		}
	},
	mounted() {
		// this.startMonitor()
	},
	methods: {
		// eslint-disable-next-line no-unused-vars
		tableRowStyle({ row, rowIndex }) {
			if (row.requestTime <= 50) {
				return {color: 'green'}
			} else if (row.requestTime <= 100) {
				return {color: '#e6a23c'}
			} else {
				return {color: 'red'}
			}
		},
		getStaticMonitor(){
// 获取iframe下所有资源类型的性能条目
			const entries = window.performance.getEntriesByType(this.selectedType)
			this.tableData = []
			for (let i = 0; i < entries.length; i++) {
				this.tableData.push({
					name: entries[i].name,
					initiatorType: entries[i].initiatorType,
					// fileType: entries[i].name.replace(/(^.*)(\..*$)/, '$2'),
					lookupTime: parseFloat((entries[i].domainLookupEnd - entries[i].domainLookupStart).toFixed(2)),
					tcpTime: parseFloat((entries[i].connectEnd - entries[i].connectStart).toFixed(2)),
					sslTime: parseFloat((entries[i].connectEnd - entries[i].secureConnectionStart).toFixed(2)),
					requestTime: parseFloat((entries[i].responseStart - entries[i].requestStart).toFixed(2)),
					responseTime: parseFloat((entries[i].responseEnd - entries[i].responseStart).toFixed(2)),
					transferSize: parseFloat((entries[i].transferSize / 1000).toFixed(2)),
					firstByteTime: parseFloat((entries[i].responseStart - entries[i].domainLookupStart).toFixed(2)),
				})
			}
		},
		closeCard(){
			this.visible = !this.visible
			this.tableData = []
		},
		downloadData(){
			let csvContent = "data:text/csv;charset=utf-8,";
			const headerRow = '请求路径,类型,域名解析ms,tcp建连ms,ssl建连ms,请求耗时ms,响应耗时ms,传输大小kb,首包时间ms\r\n';
			csvContent += headerRow;
			for (let i = 0; i < this.tableData.length; i++) {
				const rowData = Object.values(this.tableData[i]).join(',');
				csvContent += rowData + '\r\n';
			}
			const link = document.createElement('a');
			link.href = encodeURI(csvContent);
			link.download = "data.csv";
			link.click();
		}
	},
	directives: {
		drag(el) {
			const oDiv = el // 当前元素
			// 获取可视区域的宽高
			const viewWidth = document.documentElement.clientWidth
			const viewHeight = document.documentElement.clientHeight
			// 计算元素最大可移动距离
			const maxLeft = viewWidth - oDiv.offsetWidth
			const maxTop = viewHeight - oDiv.offsetHeight
			// let self = this // 上下文
			// 禁止选择网页上的文字
			// eslint-disable-next-line func-names
			document.onselectstart = function () {
				return false
			}
			// eslint-disable-next-line func-names
			oDiv.onmousedown = function (e) {
				// 鼠标按下，计算当前元素距离可视区的距离
				const disX = e.clientX - oDiv.offsetLeft
				const disY = e.clientY - oDiv.offsetTop
				// eslint-disable-next-line no-shadow,func-names
				document.onmousemove = function (e) {
					// 通过事件委托，计算移动的距离
					let l = e.clientX - disX
					let t = e.clientY - disY

					// 限制元素位置不超出可视区域
					if (l < 0) l = 0
					if (l > maxLeft) l = maxLeft
					if (t < 0) t = 0
					if (t > maxTop) t = maxTop

					// 移动当前元素
					oDiv.style.left = `${l}px`
					oDiv.style.top = `${t}px`
				}
				// eslint-disable-next-line no-shadow,no-unused-vars,func-names
				document.onmouseup = function (e) {
					document.onmousemove = null
					document.onmouseup = null
				}
				// return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
				return false
			}
		}
	}
})
</script>

<style scoped>
.button-box {
	border-radius: 50%;
	position: fixed;
	bottom: 50px;
	left: 20px;
	width: 80px;
	height: 80px;
	cursor: pointer;
	opacity: 0.9;
	z-index: 888;
}
.button-box:hover {
	opacity: 1;
}
.button-badge {
	width: 80px;
	height: 80px;
	background-image: url('data:image/png;base64,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');
	background-size: cover;
	box-shadow: 0px 0px 10px 10px rgb(0 0 0 / 31%);
}
.button-badge:hover {
	box-shadow: 0px 0px 10px 10px rgb(0 0 0 / 50%);
}

.bounce-enter-active {
	animation: bounce-in 0.6s;
}
.bounce-leave-active {
	animation: bounce-in 0.6s reverse;
}
@keyframes bounce-in {
	0% {
		transform: scale(0);
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}
.box-card-parent {
	position: fixed;
	width: 100%;
	height: 100vh;
}

.box-card {
	width: 80%;
	height: 80%;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	box-shadow: 0px 0px 200px 200px rgba(0, 0, 0, 0.4);
	border-radius: 1rem;
}
.success-row {
	margin-left: 2px;
	color: green;
}
.warning-row {
	margin-left: 2px;
	color: #e6a23c;
}
.error-row {
	margin-left: 2px;
	color: red;
}
.color {
	margin-left: 5px;
	display: inline-block;
	height: 10px;
	width: 10px;
}
.success_back {
	background: green;
}
.warning_back {
	background: #E6A23C;
}
.error_back {
	background: red;
}
</style>

<template>
    <el-table :data="data.infoList" height="250" style="width: 100%">
        <el-table-column prop="params.response.url" label="域名" width="180" />
        <el-table-column prop="params.response.remoteIPAddress" label="远程地址" width="180" />
        <el-table-column prop="address" label="Address" />
    </el-table>
</template>

<script setup>
import {onMounted, reactive} from "vue";

let data =reactive({
    infoList: [],
    list: [
        {
            date: '2016-05-03',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-02',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-04',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-01',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-08',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-06',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
        {
            date: '2016-05-07',
            name: 'Tom',
            address: 'No. 189, Grove St, Los Angeles',
        },
    ]
})

onMounted(()=>{
    // 接收background.js传来的信息
    chrome.runtime.onMessage.addListener(msg => {
        if (msg.type === 'ajaxInject-content') {
            data.infoList.push(msg.data)
            console.log(data.infoList)
            // postMessage({...msg, to: 'pageScript'});
        }
    });
})
</script>

<style scoped>

</style>

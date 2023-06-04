<template>
  <div class="wrapper">
      <el-button v-if="data.isSelect" type="success" @click="handleDeleteDebugTab(data.currTabUrl)">删除当前站点</el-button>
      <el-button v-else type="success" @click="handleAddDebugTab">添加当前站点</el-button>
      <el-button type="default" @click="handleClearAllDebugTab">清空</el-button>
      <el-button>{{data.type}}</el-button>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue";

const data =reactive({
    cmd_type: '',
    currTabId: '',
    currTabUrl : '',
    isSelect: false,
    matchUrls: {
        type: 'all',
        list: []
    }
})

const handleAddDebugTab = () => {
        chrome.storage.local.get([data.currTabUrl], function(result) {
          if (result[data.currTabUrl] !== undefined) {
            if (!result[data.currTabUrl].includes(data.currTabUrl)) {
              result.DebugTabs.push(data.currTabUrl)
              chrome.storage.local.set({DebugTabs: result.DebugTabs}, function() {
                data.isSelect = true
                chrome.tabs.reload(data.currTabId)
                console.log('Array updated')
              });
            }
          } else {
            const temp = []
            temp.push(data.currTabUrl)
            chrome.storage.local.set({DebugTabs: temp}, function() {
              data.isSelect = true
              chrome.tabs.reload(data.currTabId)
              console.log('Array updated')
            });
          }
        });
}

const handleDeleteDebugTab = (url) => {
    chrome.storage.local.get(['DebugTabs'], function(result) {
        let index = result.DebugTabs.indexOf(url);
        if (index !== -1) {
            result.DebugTabs.splice(index, 1);
            chrome.storage.local.set({DebugTabs: result.DebugTabs}, function() {
                data.isSelect = false
                chrome.tabs.reload(data.currTabId)
                console.log('Array updated')
            });
        }
    });
}

const handleClearAllDebugTab = () => {
    chrome.storage.local.get(['DebugTabs'], function(result) {
        if (result === {}) {
            chrome.storage.local.set({DebugTabs: []}, function() {
                console.log('Data init');
            });
            return
        }
        var myMap = new Map(result.DebugTabs);
        myMap.clear()
        chrome.storage.local.set({DebugTabs: [...myMap]}, function() {
            console.log('Clear all DebugTabs');
        });
    });
}

// eslint-disable-next-line no-unused-vars
const handleAddDebugApi = (url) => {

}

onMounted(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        data.currTabId = tabs[0].id;
        data.currTabUrl = (new URL(tabs[0].url)).hostname
        chrome.storage.local.get(['DebugTabs'], function(result) {
            if (Array.isArray(result.DebugTabs)) {
                data.isSelect = result.DebugTabs.includes(data.currTabUrl)
            } else {
                chrome.storage.local.set({DebugTabs: []}, function() {
                    console.log('Data init');
                });
            }
        });
    });
})
</script>
<style scoped>
.wrapper{
  background-color: transparent;
}
</style>

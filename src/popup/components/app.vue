<template>
  <div class="wrapper">
      <el-row :gutter="10">
          <el-col :span="4">
              <el-button v-if="data.isSelect" type="success" @click="handleDeleteDebugTab(data.currTabUrl)">移除当前网站</el-button>
              <el-button v-else type="success" @click="handleAddDebugTab">添加当前网站</el-button>
          </el-col>
          <el-col :span="4">
              <el-button type="success" @click="handleDeleteDB" :disabled="data.isSelect">删除当前数据</el-button>
          </el-col>
          <el-col :span="4">
              <el-button type="default" @click="handleClearAllDebugTab">清空</el-button>
          </el-col>
      </el-row>
      <h5>当前监听域名</h5>
      <div>
          <template v-for="(item,i) in data.debugTabs" :key="i">
              <el-tag type="success">
                  {{item}}
                  <el-button link style="margin-right: -.4rem;" @click="handleDeleteDebugTab(item)">x</el-button>
              </el-tag>
          </template>
      </div>
  </div>
</template>
<script setup>
import {onMounted, reactive} from "vue";

const data =reactive({
    currTabId: '',
    currTabUrl : '',
    isSelect: false,
    debugTabs: []
})

const handleAddDebugTab = () => {
        chrome.storage.local.get([data.currTabUrl], function(result) {
          if (result[data.currTabUrl] !== undefined) {
            if (!result[data.currTabUrl].includes(data.currTabUrl)) {
              result.DebugTabs.push(data.currTabUrl)
              chrome.storage.local.set({DebugTabs: result.DebugTabs}, function() {
                  data.isSelect = true;
                  data.debugTabs = Array.from(result.DebugTabs);
                  chrome.tabs.reload(data.currTabId);
                  console.log('Array updated');
              });
            }
          } else {
            const temp = []
            temp.push(data.currTabUrl)
            chrome.storage.local.set({DebugTabs: temp}, function() {
              data.isSelect = true
                data.debugTabs = temp
              chrome.tabs.reload(data.currTabId)
              console.log('Array updated')
            });
          }
            handlesetBadgeText('on')
        });
}

const handleDeleteDebugTab = (url) => {
    if (url === data.currTabUrl){
        handlesetBadgeText('off')
    }
    chrome.storage.local.get(['DebugTabs'], function(result) {
        let index = result.DebugTabs.indexOf(url);
        if (index !== -1) {
            result.DebugTabs.splice(index, 1);
            chrome.storage.local.set({DebugTabs: result.DebugTabs}, function() {
                data.isSelect = false
                data.debugTabs = Array.from(result.DebugTabs)
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

const handleDeleteDB = () => {
    chrome.tabs.sendMessage(data.currTabId, { type:'Close-delete-DB', from:'popup',data: data.currTabUrl });
}

const handlesetBadgeText = (text) => {
    chrome.browserAction.setBadgeText({ text: text });
}

onMounted(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        data.currTabId = tabs[0].id;
        data.currTabUrl = (new URL(tabs[0].url)).hostname
        chrome.storage.local.get(['DebugTabs'], function(result) {
            if (Array.isArray(result.DebugTabs)) {
                data.isSelect = result.DebugTabs.includes(data.currTabUrl)
                data.debugTabs = Array.from(result.DebugTabs)
            } else {
                chrome.storage.local.set({DebugTabs: []}, function() {
                    data.debugTabs = []
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
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>

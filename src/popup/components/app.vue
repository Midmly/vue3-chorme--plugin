<template>
  <div class="wrapper">
    <el-button type="success" @click="test">插入性能测试工具</el-button>
  </div>
</template>
<script setup>
const test = () => {
  chrome.tabs.getSelected(null, function(tab){
  chrome.tabs.sendRequest(tab.id, { popAction: "Test"});
  });
}
</script>
<style scoped>
.wrapper{
  width: auto;
  height: auto;
  background-color: transparent;
}
</style>

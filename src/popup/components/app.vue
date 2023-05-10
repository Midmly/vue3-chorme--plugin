<template>
  <div class="wrapper">
    <el-button type="success" @click="ContentInitFun">插入性能测试工具</el-button>
  </div>
</template>
<script>
import {defineComponent} from "vue";
export default defineComponent({
    data(){
      return {
      }
    },
    methods:{
        ContentInitFun() {
            chrome.tabs.getSelected(null, function(tab){
                chrome.tabs.sendMessage(tab.id, { cmd: 'ContentInitFun'});
                fetch('https://api.ip.sb/geoip').then(resp => {
                    resp.json().then(jsData => {
                        chrome.tabs.sendMessage(tab.id, { cmd: 'IpData', data: jsData});
                    })
                });
            });
        }
    }
})
</script>
<style scoped>
.wrapper{
  width: auto;
  height: auto;
  background-color: transparent;
}
</style>

<template>
    <el-row :gutter="10" style="overflow: hidden;max-width: 96%;">
        <el-col :span="12">
            <el-input v-model="data.likeKeyword" placeholder="通过域名模糊搜索"></el-input>
        </el-col>
        <el-col :span="1.5">
            <el-button type="success" @click="handleSearchByUrl">搜索</el-button>
        </el-col>
        <el-col :span="1.5">
            <el-button type="success" @click="handleInit">刷新</el-button>
        </el-col>
    </el-row>
    <el-table :data="data.list" style="width: 100%;height: 85%">
        <el-table-column sortable prop="url" label="域名" width="auto">
            <template #default="scope">
                    <el-tooltip
                        placement="top"
                        title="域名"
                        trigger="hover"
                        :content="scope.row.url"
                        :popper-style="{zIndex: 5000,maxWidth: '90%'}"
                    >
                        <el-tag
                            type="success"
                            disable-transitions
                            style="width: auto;max-width: 100%;overflow: hidden;"
                        >
                            {{ scope.row.url }}
                        </el-tag>
                    </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column sortable prop="method" label="method" width="100"/>
        <el-table-column sortable prop="status" label="status" width="100"/>
        <el-table-column sortable prop="type" label="type" width="100"/>
        <el-table-column sortable prop="requestTime" label="请求时间" width="160">
            <template #default="scope">
                <el-tag
                    disable-transitions
                    style="width: auto;max-width: 100%;overflow: hidden;"
                >
                    {{ new Date(scope.row.requestTime).toLocaleString() }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column sortable prop="responseTime" label="响应时间" width="160">
            <template #default="scope">
                <el-tag
                    disable-transitions
                    style="width: auto;max-width: 100%;overflow: hidden;"
                >
                    {{ new Date(scope.row.responseTime).toLocaleString() }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Operations" width="100">
            <template #default="scope">
                <el-button size="small" type="success" @click="handleView(scope.$index, scope.row)"
                >预览</el-button>
            </template>
        </el-table-column>

    </el-table>
    <el-pagination
        v-model:current-page="data.pagination.currentPage"
        v-model:page-size="data.pagination.pageSize"
        :page-sizes="[30, 60, 90, 120]"
        :small="false"
        :disabled="false"
        :background="true"
        layout="total, prev, pager, next, jumper"
        :total="data.pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin: 0.5rem;"
    />
    <el-drawer
        v-model="data.drawerVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :z-index="4100"
        :with-header="false"
        :show-close="false"
        size="80%"
    >
        <el-descriptions
            class="margin-top"
            title="详细信息"
            :column="1"
            border
        >
            <template #extra>
                <el-button type="primary" @click="data.drawerVisible = false">关闭</el-button>
            </template>
            <el-descriptions-item>
                <template #label>
                        请求地址
                </template>
                    <span style="word-break: break-word;background-color: bisque;">{{ data.selectObj.url }}</span>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                        请求方法
                </template>
                <el-tag>{{ data.selectObj.method }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    响应状态
                </template>
                <el-tag :type="data.selectObj.status === 200 ? 'success':'warning'">{{ data.selectObj.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    请求类型
                </template>
                <el-tag type="info">{{ data.selectObj.type }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    请求时间
                </template>
                <el-tag type="success">{{ new Date(data.selectObj.requestTime).toLocaleString() }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    响应时间
                </template>
                <el-tag type="success">{{ new Date(data.selectObj.responseTime).toLocaleString() }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    请求头
                </template>
                <el-button @click="handleViewReqHeaders" :disabled="data.selectObj.requestHeaders === undefined">查看</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    响应头
                </template>
                <el-button @click="handleViewRespHeaders" :disabled="data.selectObj.responseHeaders === undefined">查看</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
                <template #label>
                    responseData
                </template>
                <el-button @click="handleViewRespData">查看</el-button>
            </el-descriptions-item>
        </el-descriptions>
        <h4 style="margin: .5rem">JSON美化(默认展示响应数据)</h4>
        <json-viewer
            :value="data.selectJson"
            :expand-depth=5
            copyable
            boxed
            sort
            show-array-index
        />
        <h4 style="margin: .5rem">文本数据</h4>
        <el-input
            v-model="data.selectText"
            :rows="10"
            type="textarea"
            placeholder="Please input"
        />
    </el-drawer>
</template>

<script setup>
import {onMounted, reactive} from "vue";
import JsonViewer from "vue-json-viewer";
import {ElMessage} from "element-plus";

let data =reactive({
    visible: true,
    activeName: 'first',
    list:[],
    pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 30,
    },
    selectObj: {
        method: null,
        url: null,
        status: null,
        type: null,
        requestTime: null,
        responseTime: null,
        requestHeaders: null,
        responseHeaders: null,
        responseData: null
    },
    selectJson: {},
    selectText: {},
    drawerVisible: false,
    likeKeyword: '',
})

const handleView = (index, row) => {
    data.drawerVisible = true;
    data.selectObj = row;
    handleViewRespData();
}

const handleViewReqHeaders = () => {
    data.selectJson = {};
    try {
        if (data.selectObj.requestHeaders instanceof Object) {
            data.selectJson = data.selectObj.requestHeaders;
        } else {
            data.selectJson = JSON.parse(data.selectObj.requestHeaders);
        }
    }catch (e) {
        ElMessage.error(e)
    }
    finally {
        data.selectText = JSON.stringify(data.selectObj.requestHeaders)
    }
}

const handleViewRespHeaders = () => {
    data.selectJson = {};
    try {
        if (data.selectObj.responseHeaders instanceof Object) {
            data.selectJson = data.selectObj.responseHeaders;
        } else {
            data.selectJson = JSON.parse(data.selectObj.responseHeaders);
        }
    }catch (e) {
        ElMessage.error(e)
    }
    finally {
        data.selectText = JSON.stringify(data.selectObj.responseHeaders)
    }
}

const handleViewRespData = () => {
    data.selectJson = {};
    try {
        if (data.selectObj.responseData instanceof Object) {
            data.selectJson = data.selectObj.responseData;
        } else {
            data.selectJson = JSON.parse(data.selectObj.responseData);
        }
    }catch (e) {
        ElMessage.error(e)
    }
    finally {
        data.selectText = JSON.stringify(data.selectObj.responseData)
    }
}

const handleSizeChange = (val) => {
    data.pagination.pageSize = val;
    handleGetList();
}
const handleCurrentChange = (val) => {
    data.pagination.currentPage = val;
    handleGetList();
}

const handleSearchByUrl = () => {
    if (data.likeKeyword.length>0){
        window.requestTable.filter(record => {
            const regex = new RegExp(data.likeKeyword, 'i');
            return regex.test(record.url);
        }).toArray().then( list => {
            data.list = list;
            data.pagination= {
                total: list.length,
                currentPage: 1,
                pageSize: list.length,
            }
        })
    }else {
        handleGetList()
    }
}

const handleGetList = () => {
    const startIndex = (data.pagination.currentPage - 1) * data.pagination.pageSize; // 计算起始索引
    window.requestTable.offset(startIndex).limit(data.pagination.pageSize).toArray().then(list => {
        data.list = list;
    });
}
const handleInit = () => {
    window.requestTable.count().then(count=>{
        data.pagination.total = count;
        handleGetList();
    });
}

onMounted(()=>{
    handleInit();
})
</script>

<style scoped lang="css">
:deep(.el-table__inner-wrapper) {
    height: 100%;
}

</style>

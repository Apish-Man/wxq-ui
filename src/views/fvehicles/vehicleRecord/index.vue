<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="记录编号" prop="recordId">
        <el-input
          v-model="queryParams.recordId"
          placeholder="请输入记录编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆编号" prop="vehicleId">
        <el-input
          v-model="queryParams.vehicleId"
          placeholder="请输入车辆编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车牌号" prop="licensePlate">
        <el-input
          v-model="queryParams.licensePlate"
          placeholder="请输入车牌号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车库编号" prop="garageId">
        <el-input
          v-model="queryParams.garageId"
          placeholder="请输入车库编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车库位置" prop="garageLocation">
        <el-input
          v-model="queryParams.garageLocation"
          placeholder="请输入车库位置"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="进出动作" prop="action">
        <el-select
          v-model="queryParams.action"
          placeholder="请选择进出动作"
          clearable
          @change="handleQuery"
        >
          <el-option label="进" value="1"></el-option>
          <el-option label="出" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="进出状态" prop="actionStatus">
        <el-select
          v-model="queryParams.actionStatus"
          placeholder="请选择进出状态"
          clearable
          @change="handleQuery"
        >
          <el-option label="成功" value="1"></el-option>
          <el-option label="失败" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fvehicles:vehicleRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['fvehicles:vehicleRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="vehicleRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录编号" align="center" prop="recordId" :formatter="formatRecordId" />
      <el-table-column label="车辆编号" align="center" prop="vehicleId">
        <template slot-scope="scope">
          <span>{{ scope.row.vehicleId ? scope.row.vehicleId : '空' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车牌号" align="center" prop="licensePlate" />
      <el-table-column label="车辆类型" align="center" prop="vehicleType">
        <template slot-scope="scope">
          <span>{{ scope.row.vehicleType ? scope.row.vehicleType : '空' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车辆型号" align="center" prop="vehicleModel">
        <template slot-scope="scope">
          <span>{{ scope.row.vehicleModel ? scope.row.vehicleModel : '空' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车辆颜色" align="center" prop="vehicleModel">
        <template slot-scope="scope">
          <span>{{ scope.row.vehicleColor ? scope.row.vehicleColor : '空' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车库编号" align="center" prop="garageId" :formatter="formatGarageId" />
      <el-table-column label="车库位置" align="center" prop="garageLocation" />
      <el-table-column label="进出动作" align="center" prop="action" :formatter="formatAction" />
      <el-table-column label="进出时间" align="center" prop="actionTime" width="180" sortable>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.actionTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进出状态" align="center" prop="actionStatus" :formatter="formatActionStatus" />
      <el-table-column label="备注" align="center" prop="Remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fvehicles:vehicleRecord:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { listVehicleRecord, getVehicleRecord, delVehicleRecord, addVehicleRecord, updateVehicleRecord } from "@/api/fvehicles/vehicleRecord";

export default {
  name: "VehicleRecord",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 进出记录表格数据
      vehicleRecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        recordId: null,
        vehicleId: null,
        licensePlate: null,
        garageId: null,
        garageLocation: null,
        action: null,
        actionStatus: null,
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 格式化记录编号
    formatRecordId(row) {
      return row.recordId.toString().padStart(6, "0");
    },
    // 格式化车辆编号
    formatVehicleId(row) {
      return row.vehicleId.toString().padStart(6, "0");
    },
    // 格式化车库编号
    formatGarageId(row) {
      return row.garageId.toString().padStart(6, "0");
    },
    // 格式化进出动作
    formatAction(row) {
      return row.action === "1" ? "进" : "出";
    },
    // 格式化进出状态
    formatActionStatus(row) {
      return row.actionStatus === "1" ? "成功" : "失败";
    },
    /** 查询进出记录列表 */
    /** 查询进出记录列表 */
    getList() {
      this.loading = true;
      listVehicleRecord(this.queryParams).then(response => {
        // 对返回的数据按 actionTime 从大到小排序
        this.vehicleRecordList = response.rows.sort((a, b) => {
          // 将 actionTime 字符串转换为时间戳进行比较
          return new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime();
        });
        console.log(response.rows);
        console.log(this.vehicleRecordList);
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.recordId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const recordIds = row.recordId || this.ids;
      this.$modal.confirm('是否确认删除进出记录编号为"' + recordIds + '"的数据项？').then(function() {
        return delVehicleRecord(recordIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('fvehicles/vehicleRecord/export', {
        ...this.queryParams
      }, `vehicleRecord_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

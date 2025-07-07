<template>
  <div class="app-container">
<!--    查询参数-->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="价格编号" prop="pricingId">
        <el-input
          v-model="queryParams.pricingId"
          placeholder="请输入价格编号"
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
      <el-form-item label="总车位数" prop="totalCapacity">
        <el-input
          v-model="queryParams.totalCapacity"
          placeholder="请输入车库总车位数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车位价格 " prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入车位价格 "
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['manage:pricingGarage:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:pricingGarage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:pricingGarage:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['manage:pricingGarage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    数据显示-->
    <el-table v-loading="loading" :data="pricingGarageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="价格编号" align="center" prop="pricingId" />
      <el-table-column label="车库编号" align="center" prop="garageId" />
      <el-table-column label="车库位置描述" align="center" prop="location" />
      <el-table-column label="车库总车位数" align="center" prop="totalCapacity" />
      <el-table-column label="车库类型" align="center" prop="type" />
      <el-table-column label="车位价格 " align="center" prop="price" />
      <el-table-column label="货币单位" align="center" prop="currency" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:pricingGarage:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:pricingGarage:remove']"
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

    <!-- 添加或修改车库-价格视图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- 车主编号输入框,禁止编辑 -->
        <el-form-item label="车库编号" prop="garageId">
          <el-input disabled  v-model="form.garageId" placeholder="请输入车库编号" @blur="onGarageNumberInput"></el-input>
        </el-form-item>
        <!-- 车主姓名下拉选择框 -->
        <el-form-item label="车库位置" prop="location">
          <el-select
            v-model="form.location"
            remote-show-suffix
            filterable
            remote
            reserve-keyword
            placeholder="请输入车库位置"
            :remote-method="remoteMethod"
            :loading="isLoading"
            @change="onGarageChange"
          >
            <el-option
              v-for="item in garageList"
              :key="item.garageId"
              :label="item.location"
              :value="item.garageId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车位价格 " prop="price">
          <el-input v-model="form.price" placeholder="请输入车位价格 " />
        </el-form-item>
        <el-form-item label="货币单位" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入货币单位" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPricingGarage, getPricingGarage, delPricingGarage, addPricingGarage, updatePricingGarage } from "@/api/manage/pricingGarage";

import {getGarage, listGarage} from "@/api/manage/garage";
import {addPricing, delPricing, updatePricing} from "@/api/manage/pricing";

export default {
  name: "PricingGarage",
  data() {
    return {
      garageList: [],
      isLoading: false,
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
      // 车库-价格视图表格数据
      pricingGarageList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pricingId: null,
        garageId: null,
        location: null,
        totalCapacity: null,
        type: null,
        price: null,
        currency: null,
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        garageId: [
          { required: true, message: "车库编号不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "车库类型不能为空", trigger: "change" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 车库位置输入时触发
    remoteMethod(query) {
      console.log('车库位置输入', query);
      // 根据输入查询车库信息
      if (query !== '') {
        // 定义一个变量来保存查询参数
        let params = {
          pageNum: 1,
          pageSize: 10,
          location: query
        };
        this.isLoading = true;
        // 发送请求到后端API查询车主数据
        // 假设 searchOwners 是您用来从数据库中搜索数据的方法
        listGarage(params).then(response => {
          this.garageList = response.rows; // 假设返回的数据是一个数组
          this.isLoading = false;
          //   打印
          console.log('车库列表', this.garageList);
        }).catch(() => {
          this.isLoading = false;
        });
      } else {
        this.garageList = [];
      }
    },
    // 当输入车主编号时自动填充车主姓名
    onGarageNumberInput() {
      let value = this.form.garageId;
      // 从garageList中找到对应的车库信息
      // 根据车主编号查询对应的车主姓名并更新表单
      getGarage(value).then(response => {
        console.log('车库信息', response);
        let return_garage = response.data;
        //   如果结果不为空，则更新车主姓名
        if (return_garage !== null && return_garage !== undefined) {
          this.form.location = return_garage.location;
        }
        //   结果为空则提示
        else {
          this.$message.error('未找到车库编号为' + value + '的车库');
          this.form.garageId = null;
          this.form.location = null;
        }
      });
    },
    // 当选择车库位置时自动填充车库编号
    onGarageChange(value) {
      // 车主编号用0填充到6位
      value = value.toString().padStart(6, "0");
      this.form.garageId = value;
      // console.log(this.form);
    },
    /** 查询车库-价格视图列表 */
    getList() {
      this.loading = true;
      listPricingGarage(this.queryParams).then(response => {
        this.pricingGarageList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.garageList = [];
      this.form = {
        pricingId: null,
        garageId: null,
        location: null,
        totalCapacity: null,
        type: null,
        price: null,
        currency: null,
        createdAt: null,
        updatedAt: null
      };
      this.resetForm("form");
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
      this.ids = selection.map(item => item.pricingId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加车库价格";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const pricingId = row.pricingId || this.ids
      getPricingGarage(pricingId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改车库价格";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 构建提交数据
          let submitData = {
            pricingId: this.form.pricingId,
            garageId: this.form.garageId,
            price: this.form.price,
            currency: this.form.currency,
          };
          console.log('提交数据', submitData);
          if (this.form.pricingId != null) {
            updatePricing(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPricing(submitData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const pricingIds = row.pricingId || this.ids;
      this.$modal.confirm('是否确认删除车库价格编号为"' + pricingIds + '"的数据项？').then(function() {
        return delPricing(pricingIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('manage/pricingGarage/export', {
        ...this.queryParams
      }, `pricingGarage_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

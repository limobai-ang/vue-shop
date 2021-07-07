<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <el-row>
              <el-col>
                <el-button type="primary" @click="dialogTableVisibleAdd=true">添加角色</el-button>
              </el-col>
            </el-row>
            <el-row>
                <el-table
                    :data="RolesList"
                    style="width: 100%"
                    :border="true">
                    <!-- 展开列 -->
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                        <el-row :class="['vcenter','bdbuttom', index === 0 ? 'bdtop': '']" v-for="(item, index) in scope.row.children" :key="item.id">
                          <!-- 渲染一级权限 -->
                          <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row, item.id)">{{item.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                          </el-col>
                          <!-- 渲染二级和三级权限 -->
                          <el-col :span="19" >
                            <el-row :class="['vcenter', index1 === 0 ? '' : 'bdtop']" v-for="(item1, index1) in item.children" :key="item1.id">
                              <el-col :span="6">
                                <el-tag type="success" closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                              </el-col>
                              <el-col :span="18">
                                <el-tag closable @close="removeRightById(scope.row, item2.id)" v-for="(item2) in item1.children" :key="item2.id" type="warning">{{item2.authName}}</el-tag>
                              </el-col>
                            </el-row>
                          </el-col>
                        </el-row>
                      </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column
                    label="#"
                    type="index"
                    width="50">
                    </el-table-column>
                    <el-table-column
                    prop="roleName"
                    label="角色名称">
                    </el-table-column>
                    <el-table-column
                    prop="roleDesc"
                    label="角色描述">
                    </el-table-column>
                    <el-table-column
                    label="操作"
                    width="300px">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="gteEditRoles(scope.row.id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoles(scope.row.id)">删除</el-button>
                            <el-button type="warning" icon="el-icon-s-tools" size="mini" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="dialogTableVisibleAdd"
            @close="addDialogClose"
            width="50%">
            <el-form :model="addRolesForm" status-icon :rules="rolesFormRules" ref="rolesFormRef" label-width="80px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRolesForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogTableVisibleAdd = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色对话框 -->
        <el-dialog
            title="编辑角色"
            :visible.sync="dialogTableVisibleEdit"
            width="50%">
            <el-form :model="editRolesForm" status-icon :rules="rolesFormRules" ref="rolesFormRef" label-width="80px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRolesForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogTableVisibleEdit = false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限对话框 -->
        <el-dialog
          title="分配权限"
          :visible.sync="setRightsDialogVisible"
          width="30%"
          @close="setRightsDialogClosed"
          >
          <!-- 树形控件 -->
          <el-tree
            :data="rightsList"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            default-expand-all
            :default-checked-keys="defKeys"
            ref="treeRef"
            ></el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRightsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      RolesList: [],
      // 添加对话框
      dialogTableVisibleAdd: false,
      // 编辑对话框
      dialogTableVisibleEdit: false,
      // 分配权限对话框
      setRightsDialogVisible: false,
      // 分配权限列表
      rightsList: {},
      // 树形控件的属性绑定对象
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选种数组
      defKeys: [],
      // 角色授权id
      roleAuthorizationId: '',
      // 添加表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑表单数据
      editRolesForm: {
        roleName: '',
        roleDesc: '',
        roleId: ''
      },
      // 用户信息验证规则
      rolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      this.RolesList = res.data
      console.log(this.RolesList)
    },
    // 添加角色
    async addRoles () {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/roles', this.addRolesForm)
        if (res.meta.status !== 201) return this.$message.error('创建角色错误：' + res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.dialogTableVisibleAdd = false
      })
    },
    // 关闭对话框执行的函数
    addDialogClose () {
      // 清空对话框内的表单内容
      this.$refs.rolesFormRef.resetFields()
    },
    // 编辑角色获取角色数据
    async gteEditRoles (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('角色获取错误：' + res.meta.msg)
      this.editRolesForm = res.data
      this.dialogTableVisibleEdit = true
      console.log(this.editRolesForm)
    },
    // 编辑角色完成后提交
    async editRoles () {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editRolesForm.roleId}`, this.editRolesForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('角色编辑错误：' + res.meta.msg)
        this.$message.success('角色编辑成功')
        this.getRolesList()
        this.dialogTableVisibleEdit = false
      })
    },
    // 删除角色
    async removeRoles (id) {
      const confirmResult = await this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('角色删除失败：' + res.meta.msg)
      console.log(res)
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 点击删除权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('角色权限删除失败：' + res.meta.msg)
      role.children = res.data
    },
    // 权限分配对话框
    async showSetRightsDialog (node) {
      this.roleAuthorizationId = node.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败：' + res.meta.msg)
      console.log(res)
      this.rightsList = res.data
      this.getLeafKeys(node, this.defKeys)
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有的三级权限的id 并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含children属性则是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭权限弹框的函数
    setRightsDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys()
      ]
      this.$refs.treeRef.getHalfCheckedNodes().forEach(item => {
        keys.push(item.id)
      })
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.roleAuthorizationId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('角色授权失败：' + res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  },
  created () {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbuttom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>

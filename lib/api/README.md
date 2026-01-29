# API 使用说明

本项目所有API接口都遵循统一的响应格式规范。

## 响应格式规范

### BaseResponse - 用于新增、修改、删除操作

```typescript
interface BaseResponse {
  resultCode: string  // 结果码
  resultDesc: string  // 结果描述
  message: string     // 消息提示
}
```

**响应示例：**
```json
{
  "resultCode": "200",
  "resultDesc": "操作成功",
  "message": "数据已成功保存"
}
```

### PageQueryResponse - 用于查询操作

```typescript
interface PageQueryResponse<T> {
  results: T[]        // 查询结果数组
  totalitems: number  // 总记录数
  status: string      // 状态
  resultCode: string  // 结果码
  resultDesc: string  // 结果描述
  message: string     // 消息提示
}
```

**响应示例：**
```json
{
  "results": [
    {"id": 1, "name": "示例数据"}
  ],
  "totalitems": 100,
  "status": "success",
  "resultCode": "200",
  "resultDesc": "查询成功",
  "message": "共查询到100条数据"
}
```

## API 模块

### 1. 模板管理 API (`/lib/api/template.ts`)

- `queryTemplates(params)` - 查询模板列表
- `createTemplate(template)` - 新增模板
- `updateTemplate(id, template)` - 修改模板
- `deleteTemplate(id)` - 删除模板

### 2. 向量管理 API (`/lib/api/vector.ts`)

- `queryVectors(params)` - 查询向量数据列表
- `createVector(vector)` - 新增向量数据
- `updateVector(id, vector)` - 修改向量数据
- `deleteVector(id)` - 删除向量数据
- `importVectors(file)` - 批量导入向量数据
- `testVectorSearch(text)` - 实时调测向量检索

### 3. 模型管理 API (`/lib/api/model.ts`)

- `queryModels(params)` - 查询模型配置列表
- `createModel(model)` - 新增模型配置
- `updateModel(id, model)` - 修改模型配置
- `deleteModel(id)` - 删除模型配置
- `testModelConnection(id)` - 测试模型连接

## 使用示例

### 查询数据

```typescript
import { queryTemplates } from '@/lib/api/template'

const fetchData = async () => {
  try {
    const response = await queryTemplates({
      name: '示例模板',
      page: 1,
      pageSize: 10
    })
    
    // 检查响应码
    if (response.resultCode === '200') {
      console.log('查询成功:', response.results)
      console.log('总记录数:', response.totalitems)
    } else {
      console.error('查询失败:', response.message)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 新增数据

```typescript
import { createTemplate } from '@/lib/api/template'

const addData = async () => {
  try {
    const response = await createTemplate({
      name: '新模板',
      prompt: '模板内容',
      description: '模板描述'
    })
    
    // 检查响应码
    if (response.resultCode === '200') {
      console.log('新增成功:', response.message)
    } else {
      console.error('新增失败:', response.message)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 修改数据

```typescript
import { updateTemplate } from '@/lib/api/template'

const editData = async () => {
  try {
    const response = await updateTemplate(1, {
      name: '修改后的模板名称'
    })
    
    if (response.resultCode === '200') {
      console.log('修改成功:', response.message)
    } else {
      console.error('修改失败:', response.message)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 删除数据

```typescript
import { deleteTemplate } from '@/lib/api/template'

const removeData = async () => {
  try {
    const response = await deleteTemplate(1)
    
    if (response.resultCode === '200') {
      console.log('删除成功:', response.message)
    } else {
      console.error('删除失败:', response.message)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

## 错误处理

所有API函数都会在请求失败时抛出错误，建议使用try-catch进行错误处理：

```typescript
try {
  const response = await queryTemplates(params)
  // 处理成功响应
} catch (error) {
  // 处理错误
  console.error('API调用失败:', error)
  // 显示错误提示
  toast({
    variant: 'destructive',
    title: '操作失败',
    description: error.message || '请求失败，请稍后重试'
  })
}
```

## 注意事项

1. 所有API函数都返回Promise，需要使用async/await或.then()处理
2. 查询接口返回`PageQueryResponse<T>`类型，包含分页信息
3. 新增、修改、删除接口返回`BaseResponse`类型
4. 所有响应都包含`resultCode`、`resultDesc`和`message`字段
5. 建议根据`resultCode`判断操作是否成功（通常"200"表示成功）
6. API函数内部已包含console.log调试信息，便于开发调试

// 基础响应类型 - 用于新增、修改、删除操作
export interface BaseResponse {
  resultCode: string
  resultDesc: string
  message: string
}

// 分页查询响应类型 - 用于查询操作
export interface PageQueryResponse<T> {
  results: T[]
  totalitems: number
  status: string
  resultCode: string
  resultDesc: string
  message: string
}

// 模板数据类型
export interface Template {
  id: number
  name: string
  prompt: string
  description?: string
  updateTime: string
  operator: string
}

// 模板查询参数
export interface TemplateQueryParams {
  name?: string
  startTime?: Date
  endTime?: Date
  page?: number
  pageSize?: number
}

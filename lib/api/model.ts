import type { BaseResponse, PageQueryResponse } from '@/types/api'

// 模型配置类型
export interface ModelConfig {
  id: number
  name: string
  provider: string
  apiUrl: string
  apiKey: string
  maxTokens: number
  temperature: number
  timeout: number
  retryCount: number
  rateLimit: number
}

// 模型查询参数
export interface ModelQueryParams {
  name?: string
  provider?: string
  page?: number
  pageSize?: number
}

// 查询模型列表
export async function queryModels(params: ModelQueryParams): Promise<PageQueryResponse<ModelConfig>> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.name) {
      queryParams.append('name', params.name)
    }
    if (params.provider) {
      queryParams.append('provider', params.provider)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const response = await fetch(`/api/models?${queryParams.toString()}`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 查询失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '查询失败')
    }
    
    console.log('[v0] 查询成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 查询模型列表失败:', error)
    throw error
  }
}

// 新增模型配置
export async function createModel(model: Omit<ModelConfig, 'id'>): Promise<BaseResponse> {
  try {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 新增失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '新增失败')
    }
    
    console.log('[v0] 新增成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 新增模型配置失败:', error)
    throw error
  }
}

// 修改模型配置
export async function updateModel(id: number, model: Partial<ModelConfig>): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/models/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 修改失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '修改失败')
    }
    
    console.log('[v0] 修改成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 修改模型配置失败:', error)
    throw error
  }
}

// 删除模型配置
export async function deleteModel(id: number): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/models/${id}`, {
      method: 'DELETE',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 删除失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '删除失败')
    }
    
    console.log('[v0] 删除成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 删除模型配置失败:', error)
    throw error
  }
}

// 测试模型连接
export async function testModelConnection(id: number): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/models/${id}/test`, {
      method: 'POST',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 测试失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '测试失败')
    }
    
    console.log('[v0] 测试成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 测试模型连接失败:', error)
    throw error
  }
}

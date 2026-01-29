import type { BaseResponse, PageQueryResponse } from '@/types/api'

// 向量数据类型
export interface VectorData {
  id: number
  uniqueId: string
  rawText: string
  primaryLabel: string
  subLabel: string
  cleanFocus: string
  cleanContext: string
  status: 1 | 2 | 0 // 状态: 1-已清洗, 2-已入ES, 0-作废
  createdAt: string
}

// 向量查询参数
export interface VectorQueryParams {
  uniqueId?: string
  primaryLabel?: string
  subLabel?: string
  status?: string
  page?: number
  pageSize?: number
}

// 查询向量列表
export async function queryVectors(params: VectorQueryParams): Promise<PageQueryResponse<VectorData>> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.uniqueId) {
      queryParams.append('uniqueId', params.uniqueId)
    }
    if (params.primaryLabel) {
      queryParams.append('primaryLabel', params.primaryLabel)
    }
    if (params.subLabel) {
      queryParams.append('subLabel', params.subLabel)
    }
    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const response = await fetch(`/api/vectors?${queryParams.toString()}`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 查询失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '查询失败')
    }
    
    console.log('[v0] 查询成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 查询向量列表失败:', error)
    throw error
  }
}

// 新增向量数据
export async function createVector(vector: Omit<VectorData, 'id' | 'createdAt' | 'cleanFocus' | 'cleanContext' | 'status'>): Promise<BaseResponse> {
  try {
    const response = await fetch('/api/vectors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vector),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 新增失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '新增失败')
    }
    
    console.log('[v0] 新增成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 新增向量数据失败:', error)
    throw error
  }
}

// 修改向量数据
export async function updateVector(id: number, vector: Partial<VectorData>): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/vectors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vector),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 修改失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '修改失败')
    }
    
    console.log('[v0] 修改成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 修改向量数据失败:', error)
    throw error
  }
}

// 删除向量数据
export async function deleteVector(id: number): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/vectors/${id}`, {
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
    console.error('[v0] 删除向量数据失败:', error)
    throw error
  }
}

// 批量导入向量数据
export async function importVectors(file: File): Promise<BaseResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/vectors/import', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 导入失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '导入失败')
    }
    
    console.log('[v0] 导入成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 导入向量数据失败:', error)
    throw error
  }
}

// 实时调测 - 向量检索
export async function testVectorSearch(text: string): Promise<{ results: VectorData[] }> {
  try {
    const response = await fetch('/api/vectors/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 测试失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '测试失败')
    }
    
    console.log('[v0] 测试成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 向量检索测试失败:', error)
    throw error
  }
}

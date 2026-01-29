import type { BaseResponse, PageQueryResponse, Template, TemplateQueryParams } from '@/types/api'

// 格式化日期时间为 yyyy-MM-dd HH:mm:ss
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 查询模板列表
export async function queryTemplates(params: TemplateQueryParams): Promise<PageQueryResponse<Template>> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.name) {
      queryParams.append('name', params.name)
    }
    if (params.startTime) {
      queryParams.append('startTime', formatDateTime(params.startTime))
    }
    if (params.endTime) {
      queryParams.append('endTime', formatDateTime(params.endTime))
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const response = await fetch(`/api/templates?${queryParams.toString()}`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 查询失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '查询失败')
    }
    
    console.log('[v0] 查询成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 查询模板列表失败:', error)
    throw error
  }
}

// 新增模板
export async function createTemplate(template: Omit<Template, 'id' | 'updateTime' | 'operator'>): Promise<BaseResponse> {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 新增失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '新增失败')
    }
    
    console.log('[v0] 新增成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 新增模板失败:', error)
    throw error
  }
}

// 修改模板
export async function updateTemplate(id: number, template: Partial<Template>): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[v0] 修改失败，状态码:', response.status, '响应:', data)
      throw new Error(data.message || '修改失败')
    }
    
    console.log('[v0] 修改成功，返回数据:', data)
    return data
  } catch (error) {
    console.error('[v0] 修改模板失败:', error)
    throw error
  }
}

// 删除模板
export async function deleteTemplate(id: number): Promise<BaseResponse> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
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
    console.error('[v0] 删除模板失败:', error)
    throw error
  }
}

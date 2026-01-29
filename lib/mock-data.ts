import type { Template } from '@/types/api'

// 默认模板数据
const defaultTemplates: Template[] = [
  {
    id: 1,
    name: '客服质检模板',
    prompt: '请检查客服对话中是否存在不礼貌用语、回复不及时等问题...',
    description: '用于客服对话质量检查',
    updateTime: '2024-01-28 10:30:45',
    operator: '张三',
  },
  {
    id: 2,
    name: '销售话术模板',
    prompt: '评估销售对话的专业性、产品介绍准确性和客户需求把握情况...',
    description: '用于销售人员话术评估',
    updateTime: '2024-01-27 15:20:30',
    operator: '李四',
  },
  {
    id: 3,
    name: '技术支持模板',
    prompt: '检查技术支持对话的问题解决效率和技术准确性...',
    description: '技术支持对话质检标准',
    updateTime: '2024-01-26 09:15:20',
    operator: '王五',
  },
]

// 模块级变量存储数据
let templates: Template[] = [...defaultTemplates]
let nextId = 4

// 获取所有模板
export function getTemplates(): Template[] {
  return templates
}

// 设置模板列表
export function setTemplates(newTemplates: Template[]) {
  templates = newTemplates
}

// 添加模板
export function addTemplate(template: Omit<Template, 'id' | 'updateTime' | 'operator'>): Template {
  const newTemplate: Template = {
    id: nextId++,
    name: template.name,
    prompt: template.prompt,
    description: template.description,
    updateTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-'),
    operator: '当前用户',
  }
  templates.push(newTemplate)
  return newTemplate
}

// 更新模板
export function updateTemplateById(id: number, data: Partial<Template>): Template | null {
  const index = templates.findIndex((t) => t.id === id)
  if (index === -1) return null
  
  templates[index] = {
    ...templates[index],
    ...data,
    updateTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-'),
    operator: '当前用户',
  }
  return templates[index]
}

// 删除模板
export function deleteTemplateById(id: number): boolean {
  const index = templates.findIndex((t) => t.id === id)
  if (index === -1) return false
  
  templates.splice(index, 1)
  return true
}

// 根据ID查找模板
export function findTemplateById(id: number): Template | undefined {
  return templates.find((t) => t.id === id)
}

'use client'

import { useState } from 'react'
import { Search, RotateCcw, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DateTimeRangePicker from '@/components/datetime-range-picker'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { Template, TemplateQueryParams } from '@/types/api'
import {
  queryTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/lib/api/template'

interface SearchParams {
  name: string
  startTime?: Date
  endTime?: Date
}

export function TemplateManagement() {
  const { toast } = useToast()
  
  // 搜索参数状态
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: '',
    startTime: undefined,
    endTime: undefined,
  })

  // 数据状态
  const [templates, setTemplates] = useState<Template[]>([
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
  ])
  const [totalItems, setTotalItems] = useState(3)
  const [loading, setLoading] = useState(false)

  // 弹窗状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({ name: '', prompt: '', description: '' })
  const [currentStep, setCurrentStep] = useState<'basic' | 'content'>('basic')

  // 搜索功能 - 调用后端API
  const handleSearch = async () => {
    setLoading(true)
    try {
      const params: TemplateQueryParams = {
        name: searchParams.name || undefined,
        startTime: searchParams.startTime,
        endTime: searchParams.endTime,
      }
      
      const response = await queryTemplates(params)
      
      // 检查响应状态
      if (response.resultCode === '200' || response.status === 'success') {
        setTemplates(response.results)
        setTotalItems(response.totalitems)
        toast({
          title: '查询成功',
          description: response.message || `共查询到 ${response.totalitems} 条数据`,
        })
      } else {
        toast({
          variant: 'destructive',
          title: '查询失败',
          description: response.message || response.resultDesc,
        })
      }
    } catch (error) {
      console.error('[v0] 搜索失败:', error)
      toast({
        variant: 'destructive',
        title: '查询失败',
        description: '网络错误，请稍后重试',
      })
    } finally {
      setLoading(false)
    }
  }

  // 重置功能
  const handleReset = () => {
    setSearchParams({
      name: '',
      startTime: undefined,
      endTime: undefined,
    })
    // 重置后自动查询
    handleSearch()
  }

  // 新增模板
  const handleAdd = () => {
    setFormData({ name: '', prompt: '', description: '' })
    setCurrentStep('basic')
    setIsAddDialogOpen(true)
  }
  
  // 重置当前步骤表单
  const handleResetCurrentStep = () => {
    if (currentStep === 'basic') {
      setFormData({ ...formData, name: '', description: '' })
    } else {
      setFormData({ ...formData, prompt: '' })
    }
  }
  
  // 下一步
  const handleNextStep = () => {
    if (!formData.name) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请填写模板名称',
      })
      return
    }
    
    if (formData.description.length > 1024) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '描述长度不能超过1024个字符',
      })
      return
    }
    
    setCurrentStep('content')
  }
  
  // 上一步
  const handlePrevStep = () => {
    setCurrentStep('basic')
  }

  const handleAddConfirm = async () => {
    if (!formData.name || !formData.prompt) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '模板名称和提示词内容为必填项',
      })
      return
    }

    setLoading(true)
    try {
      const response = await createTemplate({
        name: formData.name,
        prompt: formData.prompt,
        description: formData.description || undefined,
      })

      if (response.resultCode === '200') {
        toast({
          title: '新增成功',
          description: response.message || '模板已成功创建',
        })
        setIsAddDialogOpen(false)
        // 刷新列表
        handleSearch()
      } else {
        toast({
          variant: 'destructive',
          title: '新增失败',
          description: response.message || response.resultDesc,
        })
      }
    } catch (error) {
      console.error('[v0] 新增失败:', error)
      toast({
        variant: 'destructive',
        title: '新增失败',
        description: '网络错误，请稍后重试',
      })
    } finally {
      setLoading(false)
    }
  }

  // 修改模板
  const handleEdit = (template: Template) => {
    setCurrentTemplate(template)
    setFormData({ 
      name: template.name, 
      prompt: template.prompt,
      description: template.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleEditConfirm = async () => {
    if (!currentTemplate) return

    if (!formData.name || !formData.prompt) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '模板名称和提示词内容为必填项',
      })
      return
    }

    setLoading(true)
    try {
      const response = await updateTemplate(currentTemplate.id, {
        name: formData.name,
        prompt: formData.prompt,
        description: formData.description || undefined,
      })

      if (response.resultCode === '200') {
        toast({
          title: '修改成功',
          description: response.message || '模板已成功更新',
        })
        setIsEditDialogOpen(false)
        // 刷新列表
        handleSearch()
      } else {
        toast({
          variant: 'destructive',
          title: '修改失败',
          description: response.message || response.resultDesc,
        })
      }
    } catch (error) {
      console.error('[v0] 修改失败:', error)
      toast({
        variant: 'destructive',
        title: '修改失败',
        description: '网络错误，请稍后重试',
      })
    } finally {
      setLoading(false)
    }
  }

  // 删除模板
  const handleDelete = (template: Template) => {
    setCurrentTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!currentTemplate) return

    setLoading(true)
    try {
      const response = await deleteTemplate(currentTemplate.id)

      if (response.resultCode === '200') {
        toast({
          title: '删除成功',
          description: response.message || '模板已成功删除',
        })
        setIsDeleteDialogOpen(false)
        // 刷新列表
        handleSearch()
      } else {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: response.message || response.resultDesc,
        })
      }
    } catch (error) {
      console.error('[v0] 删除失败:', error)
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '网络错误，请稍后重试',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        
      </div>

      {/* 搜索区域 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="template-name">模板名称</Label>
              <Input
                id="template-name"
                placeholder="请输入模板名称"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, name: e.target.value })
                }
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="update-time">更新时间</Label>
              <DateTimeRangePicker
                startDate={searchParams.startTime}
                endDate={searchParams.endTime}
                onStartDateChange={(date) =>
                  setSearchParams({ ...searchParams, startTime: date })
                }
                onEndDateChange={(date) =>
                  setSearchParams({ ...searchParams, endTime: date })
                }
                placeholder="选择时间范围"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 新增按钮 */}
      <div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增模版
        </Button>
      </div>

      {/* 数据表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模板名称</TableHead>
              <TableHead>提示词内容</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作人</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell className="max-w-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate cursor-default">
                          {template.prompt}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="whitespace-pre-wrap">{template.prompt}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="max-w-xs">
                  {template.description ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate cursor-default">
                            {template.description}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="whitespace-pre-wrap">{template.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{template.updateTime}</TableCell>
                <TableCell>{template.operator}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="mr-1 h-3 w-3 border-primary text-chart-1" />
                      修改
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="mr-1 h-3 w-3 text-destructive" />
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 新增对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex bg-background flex-col items-stretch">
          <DialogHeader>
            <DialogTitle>新增模版</DialogTitle>
            
          </DialogHeader>
          
          <Tabs value={currentStep} className="w-full min-w-0 flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="basic" 
                disabled
                className={currentStep === 'basic' ? 'text-primary font-semibold' : 'text-muted-foreground'}
              >
                基本信息 
                {currentStep === 'basic' && (
                  <Badge variant="secondary" className="ml-2">当前</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                disabled
                className={currentStep === 'content' ? 'text-primary font-semibold' : 'text-muted-foreground'}
              >
                模板内容
                {currentStep === 'content' && (
                  <Badge variant="secondary" className="ml-2">当前</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 py-4 flex-1 overflow-y-auto min-w-0">
              <div className="space-y-2">
                <Label htmlFor="add-name">
                  模板名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模板名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-description">
                  描述（最长1024字符）
                </Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length > 1024) {
                      toast({
                        variant: 'destructive',
                        title: '错误',
                        description: '描述长度不能超过1024个字符',
                      })
                      return
                    }
                    setFormData({ ...formData, description: value })
                  }}
                  placeholder="请输入描述（可选）"
                  rows={10}
                  className="w-full resize-none whitespace-pre-wrap break-all"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/1024
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 py-4 flex-1 overflow-y-auto min-w-0">
              <div className="space-y-2">
                <Label htmlFor="add-prompt">
                  模板内容 <span className="text-destructive">*</span>
                </Label>
                <div className="text-sm text-muted-foreground mb-2">
                  提示：使用 <code className="bg-muted px-1 py-0.5 rounded">${'{'}user_input{'}'}</code> 指代质检文本内容
                </div>
                <Textarea
                  id="add-prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder={`请输入模板内容，例如：
你是一个专业的文本审核助手。
请对以下文本进行质检分析：

文本内容：\${user_input}
用户信息：\${userName}

请分析文本是否存在以下问题：
1. 垃圾信息或广告
2. 恶意言论或辱骂
3. 敏感信息泄露
4. 其他违规内容

返回格式：
分类：[正常/违规]
分值：[0-10]
原因：[具体分析原因]`}
                  rows={16}
                  className="w-full resize-none whitespace-pre-wrap break-all"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {currentStep === 'basic' ? (
              <>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button variant="outline" onClick={handleResetCurrentStep}>
                  重置
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!formData.name}
                >
                  下一步
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button variant="outline" onClick={handlePrevStep}>
                  上一步
                </Button>
                <Button 
                  onClick={handleAddConfirm}
                  disabled={!formData.prompt || loading}
                >
                  创建模板
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>修改模版</DialogTitle>
            <DialogDescription>编辑模板信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                模板名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入模板名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prompt">
                提示词内容 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="请输入提示词内容"
                rows={10}
                className="w-full resize-none whitespace-pre-wrap break-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入描述（可选）"
                rows={6}
                className="w-full resize-none whitespace-pre-wrap break-all"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleEditConfirm}
              disabled={!formData.name || !formData.prompt}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板 "{currentTemplate?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

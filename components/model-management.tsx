'use client'

import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { useToast } from '@/hooks/use-toast'

interface Model {
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

// API密钥匿名化显示
const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) return '****'
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
}

interface SearchParams {
  name: string
  provider: string
}

export function ModelManagement() {
  const { toast } = useToast()

  // 搜索参数状态
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: '',
    provider: '',
  })

  // 原始数据（用于过滤）
  const [allModels] = useState<Model[]>([
    {
      id: 1,
      name: 'GPT-4',
      provider: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-proj-abc123xyz456def789',
      maxTokens: 8192,
      temperature: 0.7,
      timeout: 60,
      retryCount: 3,
      rateLimit: 10,
    },
    {
      id: 2,
      name: 'Claude-3',
      provider: 'Anthropic',
      apiUrl: 'https://api.anthropic.com/v1/messages',
      apiKey: 'sk-ant-api03-xyz789abc123',
      maxTokens: 4096,
      temperature: 0.8,
      timeout: 30,
      retryCount: 2,
      rateLimit: 5,
    },
    {
      id: 3,
      name: '通义千问',
      provider: '阿里云',
      apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      apiKey: 'sk-dashscope-qwen-abc456',
      maxTokens: 2048,
      temperature: 0.5,
      timeout: 45,
      retryCount: 3,
      rateLimit: 20,
    },
  ])
  
  // 显示的数据状态
  const [models, setModels] = useState<Model[]>([
    {
      id: 1,
      name: 'GPT-4',
      provider: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-proj-abc123xyz456def789',
      maxTokens: 8192,
      temperature: 0.7,
      timeout: 60,
      retryCount: 3,
      rateLimit: 10,
    },
    {
      id: 2,
      name: 'Claude-3',
      provider: 'Anthropic',
      apiUrl: 'https://api.anthropic.com/v1/messages',
      apiKey: 'sk-ant-api03-xyz789abc123',
      maxTokens: 4096,
      temperature: 0.8,
      timeout: 30,
      retryCount: 2,
      rateLimit: 5,
    },
    {
      id: 3,
      name: '通义千问',
      provider: '阿里云',
      apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      apiKey: 'sk-dashscope-qwen-abc456',
      maxTokens: 2048,
      temperature: 0.5,
      timeout: 45,
      retryCount: 3,
      rateLimit: 20,
    },
  ])
  const [loading, setLoading] = useState(false)

  // 弹窗状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    apiUrl: '',
    apiKey: '',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30,
    retryCount: 3,
    rateLimit: 10,
  })

  // 搜索功能
  const handleSearch = () => {
    let filteredModels = [...allModels]
    
    if (searchParams.name) {
      filteredModels = filteredModels.filter((m) =>
        m.name.toLowerCase().includes(searchParams.name.toLowerCase())
      )
    }
    
    if (searchParams.provider) {
      filteredModels = filteredModels.filter((m) =>
        m.provider.toLowerCase().includes(searchParams.provider.toLowerCase())
      )
    }
    
    setModels(filteredModels)
    toast({
      title: '查询成功',
      description: `共查询到 ${filteredModels.length} 条数据`,
    })
  }

  // 重置功能
  const handleReset = () => {
    setSearchParams({
      name: '',
      provider: '',
    })
    setModels([...allModels])
    toast({
      title: '重置成功',
      description: `共 ${allModels.length} 条数据`,
    })
  }

  // 新增模型
  const handleAdd = () => {
    setFormData({
      name: '',
      provider: '',
      apiUrl: '',
      apiKey: '',
      maxTokens: 4096,
      temperature: 0.7,
      timeout: 30,
      retryCount: 3,
      rateLimit: 10,
    })
    setIsAddDialogOpen(true)
  }

  const handleAddConfirm = () => {
    if (!formData.name || !formData.provider || !formData.apiUrl) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请填写完整信息',
      })
      return
    }

    const newModel: Model = {
      id: Date.now(),
      ...formData,
    }
    setModels([...models, newModel])
    setIsAddDialogOpen(false)
    toast({
      title: '新增成功',
      description: '模型已成功创建',
    })
  }

  // 修改模型
  const handleEdit = (model: Model) => {
    setCurrentModel(model)
    setFormData({
      name: model.name,
      provider: model.provider,
      apiUrl: model.apiUrl,
      apiKey: model.apiKey,
      maxTokens: model.maxTokens,
      temperature: model.temperature,
      timeout: model.timeout,
      retryCount: model.retryCount,
      rateLimit: model.rateLimit,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditConfirm = () => {
    if (!currentModel) return

    if (!formData.name || !formData.provider || !formData.apiUrl) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请填写完整信息',
      })
      return
    }

    const updatedModels = models.map((m) =>
      m.id === currentModel.id
        ? {
            ...m,
            ...formData,
          }
        : m
    )
    setModels(updatedModels)
    setIsEditDialogOpen(false)
    toast({
      title: '修改成功',
      description: '模型已成功更新',
    })
  }

  // 删除模型
  const handleDelete = (model: Model) => {
    setCurrentModel(model)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!currentModel) return

    setModels(models.filter((m) => m.id !== currentModel.id))
    setIsDeleteDialogOpen(false)
    toast({
      title: '删除成功',
      description: '模型已成功删除',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">模型管理</h1>
      </div>

      {/* 搜索区域 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">模型名称</Label>
              <Input
                id="model-name"
                placeholder="请输入模型名称"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-provider">供应商</Label>
              <Input
                id="model-provider"
                placeholder="请输入供应商"
                value={searchParams.provider}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, provider: e.target.value })
                }
              />
            </div>
            <div className="hidden md:block" />
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
          新增模型
        </Button>
      </div>

      {/* 数据表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型名称</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead>API地址</TableHead>
              <TableHead>API密钥</TableHead>
              <TableHead>最大Token</TableHead>
              <TableHead>温度（创意度）</TableHead>
              <TableHead>超时时间（秒）</TableHead>
              <TableHead>重试次数</TableHead>
              <TableHead>速率限制（req/s）</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-[150px] truncate cursor-help">
                          {model.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{model.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{model.provider}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-xs truncate cursor-help">
                          {model.apiUrl}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-md break-all">{model.apiUrl}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-mono text-sm cursor-help">
                          {maskApiKey(model.apiKey)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono">{model.apiKey}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{model.maxTokens}</TableCell>
                <TableCell>{model.temperature}</TableCell>
                <TableCell>{model.timeout}</TableCell>
                <TableCell>{model.retryCount}</TableCell>
                <TableCell>{model.rateLimit}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(model)}
                    >
                      <Pencil className="mr-1 h-3 w-3 text-primary" />
                      修改
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(model)}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新增模型</DialogTitle>
            
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">
                  模型名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模型名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-provider">
                  供应商 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="请输入供应商"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-apiUrl">
                API地址 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-apiUrl"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder="请输入API地址"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-apiKey">
                API密钥 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="请输入API密钥"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-maxTokens">最大Token</Label>
                <Input
                  id="add-maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-temperature">温度（创意度）</Label>
                <Input
                  id="add-temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-timeout">超时时间（秒）</Label>
                <Input
                  id="add-timeout"
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-retryCount">重试次数</Label>
                <Input
                  id="add-retryCount"
                  type="number"
                  min="0"
                  value={formData.retryCount}
                  onChange={(e) => setFormData({ ...formData, retryCount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-rateLimit">速率限制（req/s）</Label>
                <Input
                  id="add-rateLimit"
                  type="number"
                  min="1"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddConfirm}
              disabled={!formData.name || !formData.provider || !formData.apiUrl || !formData.apiKey}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>修改模型</DialogTitle>
            <DialogDescription>编辑模型配置信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  模型名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模型名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-provider">
                  供应商 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="请输入供应商"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-apiUrl">
                API地址 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-apiUrl"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder="请输入API地址"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-apiKey">
                API密钥 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="请输入API密钥"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxTokens">最大Token</Label>
                <Input
                  id="edit-maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-temperature">温度（创意度）</Label>
                <Input
                  id="edit-temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-timeout">超时时间（秒）</Label>
                <Input
                  id="edit-timeout"
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-retryCount">重试次数</Label>
                <Input
                  id="edit-retryCount"
                  type="number"
                  min="0"
                  value={formData.retryCount}
                  onChange={(e) => setFormData({ ...formData, retryCount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rateLimit">速率限制（req/s）</Label>
                <Input
                  id="edit-rateLimit"
                  type="number"
                  min="1"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleEditConfirm}
              disabled={!formData.name || !formData.provider || !formData.apiUrl || !formData.apiKey}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模型"{currentModel?.name}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

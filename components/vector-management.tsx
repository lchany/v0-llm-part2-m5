'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  RotateCcw,
  Plus,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  Play,
  FileSpreadsheet,
  Loader2,
  Eye,
  ListChecks,
  Info,
  Download,
} from 'lucide-react'
import { type ImportTask } from '@/components/import-task-panel'

// 向量数据类型
interface VectorData {
  id: number
  uniqueId: string // 唯一ID，替代dialogueId
  rawText: string // 原始文本
  primaryLabel: string
  subLabel: string
  cleanFocus: string
  cleanContext: string
  status: 1 | 2 | 0 // 状态: 1-已清洗, 2-已入ES, 0-作废
  createdAt: string
  taskId?: string // 关联的导入任务ID
  remark?: string // 备注
  finishedAt?: string // 完成时间
}

// 任务详情记录类型（展示用）
interface TaskDetailRecord {
  taskId: string
  uniqueId: string
  rawText: string
  primaryLabel: string
  subLabel: string
  status: string
  remark: string
  createdAt: string
  finishedAt: string
}

// 搜索参数类型
interface SearchParams {
  uniqueId: string
  primaryLabel: string
  subLabel: string
  status: string
}

// 标签颜色映射
const labelColors: Record<string, string> = {
  政策合规: 'bg-blue-500',
  售后支持: 'bg-orange-500',
  'VIP服务': 'bg-orange-500',
  通用FAQ: 'bg-blue-500',
  退款说明: 'bg-purple-500',
  产品破损: 'bg-orange-500',
  客服通道: 'bg-orange-500',
  账号注册: 'bg-blue-500',
}

export function VectorManagement() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab状态
  const [activeTab, setActiveTab] = useState('sample-detail')
  
  // 当前查看的任务详情
  const [currentTaskDetail, setCurrentTaskDetail] = useState<ImportTask | null>(null)

  // 搜索参数
  const [searchParams, setSearchParams] = useState<SearchParams>({
    uniqueId: '',
    primaryLabel: '',
    subLabel: '',
    status: '',
  })

  // 原始向量数据（所有数据）
  const [allVectorData, setAllVectorData] = useState<VectorData[]>([
    {
      id: 10086,
      uniqueId: 'UID_8739201',
      rawText: '客服：您好，关于退款政策我来为您说明。客户：我想知道如何退货？',
      primaryLabel: '政策合规',
      subLabel: '退款说明',
      cleanFocus: '关于退款政策的详...',
      cleanContext: 'Q: 如何退货？\nA: 请问您的订单...',
      status: 2,
      createdAt: '2024-01-28 10:30:45',
    },
    {
      id: 10087,
      uniqueId: 'UID_8739245',
      rawText: '客户：快递盒子压扁了，里面的东西坏了怎么办？客服：请拍照并联系我们处理',
      primaryLabel: '售后支持',
      subLabel: '产品破损',
      cleanFocus: '产品损坏时的理赔...',
      cleanContext: 'Q: 快递盒子压扁...\nA: 请拍照并联系...',
      status: 1,
      createdAt: '2024-01-27 15:20:30',
    },
    {
      id: 10088,
      uniqueId: 'UID_8739312',
      rawText: '客户：我是金卡会员，有专属客服通道吗？客服：您好，正在为您转接专属客服',
      primaryLabel: 'VIP服务',
      subLabel: '客服通道',
      cleanFocus: 'VIP客户的专属客...',
      cleanContext: 'Q: 我是金卡会员...\nA: 您好，正在为...',
      status: 2,
      createdAt: '2024-01-26 09:15:20',
    },
    {
      id: 10089,
      uniqueId: 'UID_8739401',
      rawText: '客户：收不到验证码怎么办？客服：请检查是否被拦截或查看垃圾短信',
      primaryLabel: '通用FAQ',
      subLabel: '账号注册',
      cleanFocus: '新用户注册流程：...',
      cleanContext: 'Q: 收不到验证码...\nA: 请检查查拦截...',
      status: 0,
      createdAt: '2024-01-25 14:45:10',
    },
  ])
  
  // 显示的向量数据（过滤后的数据）
  const [vectorData, setVectorData] = useState<VectorData[]>(allVectorData)

  // 分页
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const totalItems = 97
  const totalPages = Math.ceil(totalItems / pageSize)

  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [currentData, setCurrentData] = useState<VectorData | null>(null)

  // 表单数据
  const [formData, setFormData] = useState({
    uniqueId: '',
    rawText: '',
    primaryLabel: '',
    subLabel: '',
    cleanFocus: '',
    cleanContext: '',
    status: 1,
  })

  // 实时调测状态
  const [selectedModel, setSelectedModel] = useState('')
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  
  // 工作流模板列表（实际应该从工作流管理API获取）
  const modelOptions = [
    { value: 'workflow-quality-check', label: '质检工作流模板' },
    { value: 'workflow-compliance', label: '合规检测工作流' },
    { value: 'workflow-sentiment', label: '情感分析工作流' },
    { value: 'workflow-keyword', label: '关键词提取工作流' },
  ]
  
  // 导入任务列表
  const [allImportTasks, setAllImportTasks] = useState<ImportTask[]>([])
  const [importTasks, setImportTasks] = useState<ImportTask[]>([])

  // 导入任务搜索参数
  const [taskSearchParams, setTaskSearchParams] = useState({
    taskId: '',
    status: '',
  })

  // 任务详情搜索参数
  const [detailSearchParams, setDetailSearchParams] = useState({
    taskId: '',
    status: '',
  })

  // 任务详情记录列表
  const [taskDetailRecords, setTaskDetailRecords] = useState<TaskDetailRecord[]>([])

  // 加载状态
  const [loading, setLoading] = useState(false)

  // 搜索功能
  const handleSearch = () => {
    let filtered = [...allVectorData]
    
    // 按唯一ID过滤
    if (searchParams.uniqueId) {
      filtered = filtered.filter(data => 
        data.uniqueId.toLowerCase().includes(searchParams.uniqueId.toLowerCase())
      )
    }
    
    // 按基础类别过滤
    if (searchParams.primaryLabel) {
      filtered = filtered.filter(data => 
        data.primaryLabel.toLowerCase().includes(searchParams.primaryLabel.toLowerCase())
      )
    }
    
    // 按细分类过滤
    if (searchParams.subLabel) {
      filtered = filtered.filter(data => 
        data.subLabel.toLowerCase().includes(searchParams.subLabel.toLowerCase())
      )
    }
    
    // 按状态过滤
    if (searchParams.status && searchParams.status !== 'all') {
      const statusValue = parseInt(searchParams.status)
      filtered = filtered.filter(data => data.status === statusValue)
    }
    
    setVectorData(filtered)
    toast({
      title: '查询成功',
      description: `共查询到 ${filtered.length} 条数据`,
    })
  }

  // 重置功能
  const handleReset = () => {
    setSearchParams({
      uniqueId: '',
      primaryLabel: '',
      subLabel: '',
      status: '',
    })
    setVectorData(allVectorData)
    toast({
      title: '重置成功',
      description: '已恢复显示全部数据',
    })
  }

  // 新增数据
  const handleAdd = () => {
    setFormData({
      uniqueId: '',
      rawText: '',
      primaryLabel: '',
      subLabel: '',
      cleanFocus: '',
      cleanContext: '',
      status: 1,
    })
    setIsAddDialogOpen(true)
  }

  const handleAddConfirm = () => {
    if (!formData.uniqueId || !formData.rawText || !formData.primaryLabel || !formData.subLabel) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请填写必填项',
      })
      return
    }

    const newData: VectorData = {
      id: Date.now(),
      uniqueId: formData.uniqueId,
      rawText: formData.rawText,
      primaryLabel: formData.primaryLabel,
      subLabel: formData.subLabel,
      cleanFocus: formData.cleanFocus,
      cleanContext: formData.cleanContext,
      status: formData.status,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
    }

    const updatedData = [...allVectorData, newData]
    setAllVectorData(updatedData)
    setVectorData(updatedData)
    setIsAddDialogOpen(false)
    toast({
      title: '新增成功',
      description: '向量数据已成功添加',
    })
  }

  // 修改数据
  const handleEdit = (data: VectorData) => {
    setCurrentData(data)
    setFormData({
      uniqueId: data.uniqueId,
      rawText: data.rawText,
      primaryLabel: data.primaryLabel,
      subLabel: data.subLabel,
      cleanFocus: data.cleanFocus,
      cleanContext: data.cleanContext,
      status: data.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditConfirm = () => {
    if (!currentData) return

    if (!formData.uniqueId || !formData.rawText || !formData.primaryLabel || !formData.subLabel) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请填写必填项',
      })
      return
    }

    const updatedAllData = allVectorData.map((d) =>
      d.id === currentData.id
        ? {
            ...d,
            uniqueId: formData.uniqueId,
            rawText: formData.rawText,
            primaryLabel: formData.primaryLabel,
            subLabel: formData.subLabel,
          }
        : d
    )
    
    const updatedDisplayData = vectorData.map((d) =>
      d.id === currentData.id
        ? {
            ...d,
            uniqueId: formData.uniqueId,
            rawText: formData.rawText,
            primaryLabel: formData.primaryLabel,
            subLabel: formData.subLabel,
          }
        : d
    )

    setAllVectorData(updatedAllData)
    setVectorData(updatedDisplayData)
    setIsEditDialogOpen(false)
    toast({
      title: '修改成功',
      description: '向量数据已成功更新',
    })
  }

  // 删除数据
  const handleDelete = (data: VectorData) => {
    setCurrentData(data)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!currentData) return

    setAllVectorData(allVectorData.filter((d) => d.id !== currentData.id))
    setVectorData(vectorData.filter((d) => d.id !== currentData.id))
    setIsDeleteDialogOpen(false)
    toast({
      title: '删除成功',
      description: '向量数据已删除',
    })
  }
  
  // 导入Excel
  const handleImport = () => {
    setIsImportDialogOpen(true)
  }
  
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }
  
  const nowStr = () =>
    new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\//g, '-')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 创建异步任务，立即关闭弹窗并展示任务已提交
      const taskId = `TASK_${Date.now()}`
      const newTask: ImportTask = {
        taskId,
        fileName: file.name,
        totalRows: 0,
        successRows: 0,
        failedRows: 0,
        status: 'pending',
        message: '任务已提交，等待后端处理...',
        createdAt: nowStr(),
      }
      setAllImportTasks((prev) => [newTask, ...prev])
      setImportTasks((prev) => [newTask, ...prev])
      setIsImportDialogOpen(false)
      setShowImportHint(true)

      toast({
        title: '任务已提交',
        description: `文件 "${file.name}" 已提交异步处理，可在"样本导入任务"页签查看进度`,
      })

      // 模拟后端异步处理：先变为 processing
      setTimeout(() => {
        const updateProcessing = (t: ImportTask) =>
          t.taskId === taskId ? { ...t, status: 'processing' as const, message: '后端正在解析文件并入库...' } : t
        setAllImportTasks((prev) => prev.map(updateProcessing))
        setImportTasks((prev) => prev.map(updateProcessing))
      }, 1500)

      // 模拟后端处理完成
      setTimeout(() => {
        const simulatedTotal = Math.floor(Math.random() * 50) + 10
        const simulatedFailed = Math.floor(Math.random() * 3)
        const simulatedSuccess = simulatedTotal - simulatedFailed

        const finishedTime = nowStr()
        const successData: VectorData[] = Array.from({ length: simulatedSuccess }, (_, i) => ({
          id: Date.now() + i,
          uniqueId: `UID_${Date.now() + i}`,
          rawText: `从 ${file.name} 导入的原始话术第 ${i + 1} 条`,
          primaryLabel: ['政策合规', '售后支持', 'VIP服务', '通用FAQ'][i % 4],
          subLabel: ['退款说明', '产品破损', '客服通道', '账号注册'][i % 4],
          cleanFocus: '',
          cleanContext: '',
          status: 1 as const,
          createdAt: nowStr(),
          taskId,
          remark: '',
          finishedAt: finishedTime,
        }))
        const failedData: VectorData[] = Array.from({ length: simulatedFailed }, (_, i) => ({
          id: Date.now() + simulatedSuccess + i,
          uniqueId: `UID_${Date.now() + simulatedSuccess + i}`,
          rawText: `从 ${file.name} 导入的异常数据第 ${i + 1} 条`,
          primaryLabel: '',
          subLabel: '',
          cleanFocus: '',
          cleanContext: '',
          status: 0 as const,
          createdAt: nowStr(),
          taskId,
          remark: ['字段缺失：基础类别为空', '数据格式异常：原始文本超长', '重复数据已存在'][i % 3],
          finishedAt: finishedTime,
        }))
        const importedData = [...successData, ...failedData]

        const updatedData = [...allVectorData, ...importedData]
        setAllVectorData(updatedData)
        setVectorData(updatedData)

        const updateComplete = (t: ImportTask): ImportTask =>
          t.taskId === taskId
            ? {
                ...t,
                status: 'success',
                totalRows: simulatedTotal,
                successRows: simulatedSuccess,
                failedRows: simulatedFailed,
                message:
                  simulatedFailed > 0
                    ? `导入完成，${simulatedFailed} 条记录因格式错误跳过`
                    : '全部记录导入成功',
                finishedAt: nowStr(),
              }
            : t
        setAllImportTasks((prev) => prev.map(updateComplete))
        setImportTasks((prev) => prev.map(updateComplete))

        toast({
          title: '导入完成',
          description: `成功 ${simulatedSuccess} 条，失败 ${simulatedFailed} 条`,
        })
      }, 5000)
    }
    // 重置input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 最近是否有新导入任务（用于在样本详情上方显示提示）
  const [showImportHint, setShowImportHint] = useState(false)

  // 导入任务搜索
  const handleTaskSearch = () => {
    let filtered = [...allImportTasks]
    if (taskSearchParams.taskId.trim()) {
      filtered = filtered.filter(t =>
        t.taskId.toLowerCase().includes(taskSearchParams.taskId.trim().toLowerCase())
      )
    }
    if (taskSearchParams.status && taskSearchParams.status !== 'all') {
      filtered = filtered.filter(t => {
        if (taskSearchParams.status === 'partial') {
          return t.status === 'success' && t.failedRows > 0
        }
        if (taskSearchParams.status === 'success') {
          return t.status === 'success' && t.failedRows === 0
        }
        return t.status === taskSearchParams.status
      })
    }
    setImportTasks(filtered)
    toast({ title: '查询成功', description: `共查询到 ${filtered.length} 条任务` })
  }

  const handleTaskReset = () => {
    setTaskSearchParams({ taskId: '', status: '' })
    setImportTasks(allImportTasks)
    toast({ title: '重置成功' })
  }

  // 任务详情搜索
  const handleDetailSearch = () => {
    // 查找对应任务（如果填了taskId）
    if (detailSearchParams.taskId) {
      const task = allImportTasks.find(t =>
        t.taskId.toLowerCase().includes(detailSearchParams.taskId.toLowerCase())
      )
      setCurrentTaskDetail(task || null)
    } else {
      setCurrentTaskDetail(null)
    }
    // 查询样本记录：有taskId则按任务过滤，否则查所有
    let filtered = [...allVectorData]
    if (detailSearchParams.taskId) {
      filtered = filtered.filter(d => d.taskId && d.taskId.toLowerCase().includes(detailSearchParams.taskId.toLowerCase()))
    }
    // 按状态过滤
    if (detailSearchParams.status && detailSearchParams.status !== 'all') {
      filtered = filtered.filter(d => {
        if (detailSearchParams.status === 'success') return d.status === 1 || d.status === 2
        return d.status === 0
      })
    }
    const records = filtered.map(d => ({
      taskId: d.taskId || '',
      uniqueId: d.uniqueId,
      rawText: d.rawText,
      primaryLabel: d.primaryLabel,
      subLabel: d.subLabel,
      status: d.status === 0 ? '失败' : '成功',
      remark: d.status === 0 ? (d.remark || '数据格式异常') : (d.remark || ''),
      createdAt: d.createdAt,
      finishedAt: d.finishedAt || '-',
    }))
    setTaskDetailRecords(records)
    toast({ title: '查询成功', description: `共查询到 ${records.length} 条样本记录` })
  }

  const handleDetailReset = () => {
    setDetailSearchParams({ taskId: '', status: '' })
    setCurrentTaskDetail(null)
    setTaskDetailRecords([])
    toast({ title: '重置成功' })
  }

  // 查看任务详情
  const handleViewTaskDetail = (task: ImportTask) => {
    setCurrentTaskDetail(task)
    setDetailSearchParams({ taskId: task.taskId, status: '' })
    // 查询该任务关联的样本记录
    const records = allVectorData
      .filter(d => d.taskId === task.taskId)
      .map(d => ({
        taskId: d.taskId || '',
        uniqueId: d.uniqueId,
        rawText: d.rawText,
        primaryLabel: d.primaryLabel,
        subLabel: d.subLabel,
        status: d.status === 0 ? '失败' : '成功',
        remark: d.status === 0 ? (d.remark || '数据格式异常') : (d.remark || ''),
        createdAt: d.createdAt,
        finishedAt: d.finishedAt || '-',
      }))
    setTaskDetailRecords(records)
    setActiveTab('task-detail')
  }

  // 重试失败任务
  const handleRetryTask = (task: ImportTask) => {
    const updateRetry = (t: ImportTask): ImportTask =>
      t.taskId === task.taskId
        ? { ...t, status: 'pending', message: '任务已重新提交，等待处理...', finishedAt: undefined }
        : t
    setAllImportTasks((prev) => prev.map(updateRetry))
    setImportTasks((prev) => prev.map(updateRetry))
    toast({ title: '重试已提交', description: `任务 ${task.taskId} 已重新加入队列` })
  }

  // 实时调测
  const handleTest = async () => {
    if (!selectedModel) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请选择模型',
      })
      return
    }
    
    if (!testInput.trim()) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请输入测试文本',
      })
      return
    }

    setIsTesting(true)
    const modelName = modelOptions.find(m => m.value === selectedModel)?.label || selectedModel
    setTestOutput(`正在使用模型 ${modelName} 进行测试...`)
    
    // 模拟API调用
    setTimeout(() => {
      setTestOutput(
        `测试结果：\n\n使用模型：${modelName}\n基础类别：通用FAQ\n细分类：账号注册\n核心话术：用户咨询注册相关问题\n上下文：Q: ${testInput}\nA: 这是模拟的回答内容...\n\n相似度：0.95\n匹配向量ID：10089`
      )
      setIsTesting(false)
      toast({
        title: '测试完成',
        description: `模型 ${modelName} 调用成功`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">向量数据库管理</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val)
        if (val === 'import-tasks') setShowImportHint(false)
      }}>
        <TabsList className="inline-flex w-full md:w-2/3 lg:w-1/2">
          <TabsTrigger
            value="sample-detail"
            className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:font-semibold flex-1"
          >
            <Database className="h-4 w-4" />
            向量数据库样本
          </TabsTrigger>
          <TabsTrigger
            value="import-tasks"
            className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:font-semibold flex-1"
          >
            <Upload className="h-4 w-4" />
            样本导入任务
          </TabsTrigger>
          <TabsTrigger
            value="task-detail"
            className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:font-semibold flex-1"
          >
            <ListChecks className="h-4 w-4" />
            任务详情
          </TabsTrigger>
          <TabsTrigger
            value="test"
            className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:font-semibold flex-1"
          >
            <Play className="h-4 w-4" />
            实时调测
          </TabsTrigger>
        </TabsList>

        {/* 样本导入任务 Tab */}
        <TabsContent value="import-tasks" className="space-y-4">
          {/* 搜索区域 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>任务ID</Label>
                  <Input
                    placeholder="请输入任务ID"
                    value={taskSearchParams.taskId}
                    onChange={(e) => setTaskSearchParams({ ...taskSearchParams, taskId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>状态</Label>
                  <Select
                    value={taskSearchParams.status}
                    onValueChange={(value) => setTaskSearchParams({ ...taskSearchParams, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="processing">处理中</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
                      <SelectItem value="partial">部分成功</SelectItem>
                      <SelectItem value="failed">失败</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden md:block" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleTaskSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleTaskReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重置
                </Button>
              </div>
            </div>
          </Card>

          {/* 任务列表 */}
          <Card>
            <CardContent className="p-0">
              {importTasks.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Upload className="mx-auto mb-3 h-10 w-10 opacity-25" />
                  <p className="text-sm">暂无导入任务，请点击"Excel 导入"上传文件</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务ID</TableHead>
                      <TableHead className="text-center">总行数</TableHead>
                      <TableHead className="text-center">成功</TableHead>
                      <TableHead className="text-center">失败</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>提交时间</TableHead>
                      <TableHead>完成时间</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead className="w-[120px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importTasks.map((task) => {
                      const isPartialSuccess = task.status === 'success' && task.failedRows > 0
                      const statusMap = {
                        pending: { label: '等待中', variant: 'outline' as const },
                        processing: { label: '处理中', variant: 'secondary' as const },
                        success: { label: '成功', variant: 'default' as const },
                        failed: { label: '失败', variant: 'destructive' as const },
                      }
                      const cfg = isPartialSuccess
                        ? { label: '部分成功', variant: 'secondary' as const }
                        : statusMap[task.status]
                      return (
                        <TableRow key={task.taskId}>
                          <TableCell className="font-mono text-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="max-w-[80px] block truncate cursor-help">
                                    {task.taskId}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{task.taskId}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">{task.totalRows || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-medium">{task.successRows || '-'}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={task.failedRows > 0 ? 'text-destructive font-medium' : ''}>
                              {task.totalRows ? task.failedRows : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={cfg.variant} className="flex w-fit items-center gap-1">
                              {task.status === 'processing' && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {task.createdAt}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {task.finishedAt ?? '-'}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="max-w-[100px] block truncate text-xs text-muted-foreground cursor-help">
                                    {task.message || '-'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-sm whitespace-pre-wrap">{task.message || '-'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-primary"
                                onClick={() => handleViewTaskDetail(task)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                详情
                              </Button>
                              {task.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleRetryTask(task)}
                                >
                                  重试
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 向量数据库样本 Tab */}
        <TabsContent value="sample-detail" className="space-y-4">
          {/* 导入提示 */}
          {showImportHint && (
            <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Info className="h-4 w-4 shrink-0" />
              <span>
                导入任务已提交，请到
                <button
                  type="button"
                  className="mx-1 font-medium underline underline-offset-2 hover:text-blue-900"
                  onClick={() => { setActiveTab('import-tasks'); setShowImportHint(false) }}
                >
                  样本导入任务
                </button>
                页签查看进度
              </span>
              <button
                type="button"
                className="ml-auto text-blue-400 hover:text-blue-600"
                onClick={() => setShowImportHint(false)}
                aria-label="关闭提示"
              >
                &times;
              </button>
            </div>
          )}

          {/* 搜索区域 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unique-id">唯一ID</Label>
                  <Input
                    id="unique-id"
                    placeholder="请输入唯一ID"
                    value={searchParams.uniqueId}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, uniqueId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-label">基础类别</Label>
                  <Input
                    id="primary-label"
                    placeholder="请输入基础类别"
                    value={searchParams.primaryLabel}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, primaryLabel: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-label">细分类</Label>
                  <Input
                    id="sub-label"
                    placeholder="请输入细分类"
                    value={searchParams.subLabel}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, subLabel: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={searchParams.status}
                    onValueChange={(value) =>
                      setSearchParams({ ...searchParams, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="1">已清洗</SelectItem>
                      <SelectItem value="2">已入ES</SelectItem>
                      <SelectItem value="0">作废</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden md:block" />
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

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-white hover:bg-green-600 hover:text-white bg-primary"
              onClick={handleImport}
            >
              <Upload className="mr-2 h-4 w-4" />
              Excel 导入
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增样本
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 数据表格 */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>唯一ID</TableHead>
                    <TableHead>原始文本</TableHead>
                    <TableHead>基础类别</TableHead>
                    <TableHead>细分类</TableHead>
                    <TableHead>核心话术</TableHead>
                    <TableHead>上下文</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vectorData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[200px] truncate cursor-help">
                                {data.uniqueId}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md break-all">{data.uniqueId}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-xs truncate cursor-help">
                                {data.rawText}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md whitespace-pre-wrap">{data.rawText}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${labelColors[data.primaryLabel] || 'bg-gray-500'} text-white`}
                        >
                          {data.primaryLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${labelColors[data.subLabel] || 'bg-gray-500'} text-white`}
                        >
                          {data.subLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-xs truncate cursor-help">
                                {data.cleanFocus}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md whitespace-pre-wrap">{data.cleanFocus}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-xs truncate cursor-help">
                                {data.cleanContext}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md whitespace-pre-wrap">{data.cleanContext}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            data.status === 2
                              ? 'default'
                              : data.status === 1
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {data.status === 2 ? '已入ES' : data.status === 1 ? '已清洗' : '作废'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button className="text-primary" variant="ghost" size="sm" onClick={() => handleEdit(data)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(data)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 分页 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              显示第 {(currentPage - 1) * pageSize + 1} 到{' '}
              {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条结果
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 5 && <span className="text-sm text-muted-foreground">...</span>}
              {totalPages > 5 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                  >
                    {totalPages - 1}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 任务详情 Tab */}
        <TabsContent value="task-detail" className="space-y-4">
          {/* 搜索区域 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>任务ID</Label>
                  <Input
                    placeholder="请输入任务ID"
                    value={detailSearchParams.taskId}
                    onChange={(e) => setDetailSearchParams({ ...detailSearchParams, taskId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>状态</Label>
                  <Select
                    value={detailSearchParams.status}
                    onValueChange={(value) => setDetailSearchParams({ ...detailSearchParams, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
                      <SelectItem value="failed">失败</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden md:block" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleDetailSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleDetailReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重置
                </Button>
              </div>
            </div>
          </Card>

          {/* 任务摘要 */}
          {currentTaskDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>当前任务: <span className="font-mono">{currentTaskDetail.taskId}</span></span>
              <span className="text-border">|</span>
              <span>文件: {currentTaskDetail.fileName}</span>
              <span className="text-border">|</span>
              <span>总行数: {currentTaskDetail.totalRows}</span>
              <span className="text-border">|</span>
              <span>成功: <span className="text-green-600 font-medium">{currentTaskDetail.successRows}</span></span>
              <span className="text-border">|</span>
              <span>失败: <span className={currentTaskDetail.failedRows > 0 ? 'text-destructive font-medium' : ''}>{currentTaskDetail.failedRows}</span></span>
            </div>
          )}

          {/* 样本记录表格 */}
          <Card>
            <CardContent className="p-0">
              {taskDetailRecords.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <ListChecks className="mx-auto mb-3 h-10 w-10 opacity-25" />
                  <p className="text-sm">请从"样本导入任务"页签点击详情查看，或输入任务ID搜索</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务ID</TableHead>
                      <TableHead>唯一ID</TableHead>
                      <TableHead>原始文本</TableHead>
                      <TableHead>基础类别</TableHead>
                      <TableHead>细分类</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead>提交时间</TableHead>
                      <TableHead>完成时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskDetailRecords.map((record) => (
                      <TableRow key={record.uniqueId}>
                        <TableCell className="font-mono text-xs">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="max-w-[80px] block truncate cursor-help">
                                  {record.taskId}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{record.taskId}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{record.uniqueId}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="max-w-[200px] block truncate text-sm cursor-help">
                                  {record.rawText}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-md">
                                <p className="whitespace-pre-wrap">{record.rawText}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {record.primaryLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {record.subLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.status === '成功' ? 'default' : 'destructive'}
                            className="text-xs whitespace-nowrap"
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.remark || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {record.createdAt}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {record.finishedAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 实时调测 Tab */}
        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 输入区域 */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  <Label htmlFor="model-select" className="shrink-0">
                    工作流模板 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model-select" className="flex-1">
                      <SelectValue placeholder="请选择工作流模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-input">输入待质检对话文本，实时测验系统质量</Label>
                  <Textarea
                    id="test-input"
                    placeholder="请输入待质检的对话文本..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={10}
                    className="w-full resize-none"
                  />
                </div>
                <Button 
                  onClick={handleTest} 
                  disabled={isTesting || !selectedModel || !testInput} 
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isTesting ? '测试中...' : '开始测试'}
                </Button>
              </CardContent>
            </Card>

            {/* 结果展示区域 */}
            <Card>
              <CardHeader>
                <CardTitle>结果展示</CardTitle>
                <CardDescription>向量检索和大模型检测后结果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  
                  <Textarea
                    id="test-output"
                    value={testOutput}
                    readOnly
                    placeholder="测试结果将显示在这里..."
                    rows={10}
                    className="w-full resize-none bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 新增对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新增样本</DialogTitle>
            <DialogDescription>添加新的向量数据到知识库</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="add-unique-id">
                唯一ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-unique-id"
                value={formData.uniqueId}
                onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                placeholder="请输入唯一ID，如：UID_8739201"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-raw-text">
                原始话术 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="add-raw-text"
                value={formData.rawText}
                onChange={(e) => setFormData({ ...formData, rawText: e.target.value })}
                placeholder="请输入原始话术"
                rows={4}
                className="w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-primary-label">
                  基础类别 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-primary-label"
                  value={formData.primaryLabel}
                  onChange={(e) => setFormData({ ...formData, primaryLabel: e.target.value })}
                  placeholder="请输入基础类别"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-sub-label">
                  细分类 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-sub-label"
                  value={formData.subLabel}
                  onChange={(e) => setFormData({ ...formData, subLabel: e.target.value })}
                  placeholder="请输入细分类"
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
              disabled={!formData.uniqueId || !formData.rawText || !formData.primaryLabel || !formData.subLabel}
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
            <DialogTitle>修改样本</DialogTitle>
            <DialogDescription>编辑向量数据信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-unique-id">
                唯一ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-unique-id"
                value={formData.uniqueId}
                onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                placeholder="请输入唯一ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-raw-text">
                原始话术 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-raw-text"
                value={formData.rawText}
                onChange={(e) => setFormData({ ...formData, rawText: e.target.value })}
                placeholder="请输入原始话术"
                rows={4}
                className="w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-primary-label">
                  基础类别 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-primary-label"
                  value={formData.primaryLabel}
                  onChange={(e) => setFormData({ ...formData, primaryLabel: e.target.value })}
                  placeholder="请输入基础类别"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sub-label">
                  细分类 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-sub-label"
                  value={formData.subLabel}
                  onChange={(e) => setFormData({ ...formData, subLabel: e.target.value })}
                  placeholder="请输入细分类"
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
              disabled={!formData.uniqueId || !formData.rawText || !formData.primaryLabel || !formData.subLabel}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入Excel对话框 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入Excel</DialogTitle>
            <DialogDescription>从Excel文件批量导入向量数据</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 下载模板 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground shrink-0">下载模板:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 生成模板CSV并下载
                  const header = '唯一ID,原始文本,基础类别,细分类,核心话术,上下文'
                  const example = 'UID_001,示例原始文本,政策合规,退款说明,示例核心话术,示例上下文'
                  const csvContent = '\uFEFF' + header + '\n' + example
                  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = '导入模板.xlsx'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast({ title: '模板下载成功' })
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                下载导入模板
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                支持 .xlsx, .xls 格式文件
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                文件需包含：唯一ID、基础类别、细分类、核心话术、上下文 等列
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button className="mt-4" onClick={handleFileSelect} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    选择文件
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              关闭
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
              确定要删除唯一ID为 {currentData?.uniqueId} 的数据吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

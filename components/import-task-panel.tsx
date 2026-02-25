'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, CircleDashed, ClipboardList, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'

export type ImportTaskStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface ImportTask {
  taskId: string
  fileName: string
  totalRows: number
  successRows: number
  failedRows: number
  status: ImportTaskStatus
  message: string
  createdAt: string
  finishedAt?: string
}

interface ImportTaskPanelProps {
  tasks: ImportTask[]
  onRetry?: (task: ImportTask) => void
}

const statusConfig: Record<
  ImportTaskStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  pending: {
    label: '等待中',
    variant: 'outline',
    icon: <CircleDashed className="h-3.5 w-3.5" />,
  },
  processing: {
    label: '处理中',
    variant: 'secondary',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  success: {
    label: '成功',
    variant: 'default',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: '失败',
    variant: 'destructive',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
}

export function ImportTaskPanel({ tasks, onRetry }: ImportTaskPanelProps) {
  const [open, setOpen] = useState(false)

  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'processing').length

  return (
    <>
      {/* 任务列表入口按钮 */}
      <Button variant="outline" onClick={() => setOpen(true)} className="relative">
        <ClipboardList className="mr-2 h-4 w-4" />
        导入任务
        {pendingCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        )}
      </Button>

      {/* 任务详情弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              导入任务列表
            </DialogTitle>
          </DialogHeader>

          {tasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>暂无导入任务</p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>文件名</TableHead>
                    <TableHead className="text-center">总行数</TableHead>
                    <TableHead className="text-center">成功</TableHead>
                    <TableHead className="text-center">失败</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const cfg = statusConfig[task.status]
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
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="max-w-[120px] block truncate cursor-help text-sm">
                                  {task.fileName}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{task.fileName}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">{task.totalRows}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">{task.successRows}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={task.failedRows > 0 ? 'text-destructive font-medium' : ''}>
                            {task.failedRows}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="flex w-fit items-center gap-1">
                            {cfg.icon}
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
                          {task.status === 'failed' && onRetry && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => onRetry(task)}
                            >
                              重试
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

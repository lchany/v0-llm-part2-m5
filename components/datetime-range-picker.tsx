'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeScrollPicker } from '@/components/time-scroll-picker'
import { useToast } from '@/hooks/use-toast'

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

interface DateTimeRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

// 单个时间选择器组件
function SingleDateTimePicker({
  value,
  onChange,
  label,
  isOpen,
  onOpenChange,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  label: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tempDate, setTempDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState({
    hours: value?.getHours() || 0,
    minutes: value?.getMinutes() || 0,
    seconds: value?.getSeconds() || 0,
  })

  React.useEffect(() => {
    if (value) {
      setTempDate(value)
      setTime({
        hours: value.getHours(),
        minutes: value.getMinutes(),
        seconds: value.getSeconds(),
      })
    }
  }, [value])

  const handleConfirm = () => {
    if (tempDate) {
      const newDate = new Date(tempDate)
      newDate.setHours(time.hours)
      newDate.setMinutes(time.minutes)
      newDate.setSeconds(time.seconds)
      onChange(newDate)
    }
    onOpenChange(false)
  }

  const handleClear = () => {
    setTempDate(undefined)
    onChange(undefined)
    setTime({ hours: 0, minutes: 0, seconds: 0 })
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex-1 justify-start text-left font-normal px-3 py-2 h-auto hover:bg-muted',
            !value && 'text-muted-foreground'
          )}
        >
          <span className="text-sm">
            {value ? formatDateTime(value) : '请选择时间'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={setTempDate}
              initialFocus
            />
          </div>
          
          <div className="flex items-center justify-center gap-1 py-4 px-3 border-l bg-muted/30">
            <TimeScrollPicker
              value={time.hours}
              onChange={(v) => setTime({ ...time, hours: v })}
              max={23}
              label="时"
            />
            <TimeScrollPicker
              value={time.minutes}
              onChange={(v) => setTime({ ...time, minutes: v })}
              max={59}
              label="分"
            />
            <TimeScrollPicker
              value={time.seconds}
              onChange={(v) => setTime({ ...time, seconds: v })}
              max={59}
              label="秒"
            />
          </div>
        </div>
        
        <div className="flex gap-2 justify-end p-4 border-t">
          <Button variant="outline" size="sm" onClick={handleClear}>
            清空
          </Button>
          <Button size="sm" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DateTimeRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = '选择时间范围',
  className,
}: DateTimeRangePickerProps) {
  const { toast } = useToast()
  const [startOpen, setStartOpen] = React.useState(false)
  const [endOpen, setEndOpen] = React.useState(false)

  const handleStartDateChange = (date: Date | undefined) => {
    onStartDateChange(date)
    
    // 验证时间范围
    if (date && endDate && date >= endDate) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '开始时间必须小于结束时间',
      })
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    onEndDateChange(date)
    
    // 验证时间范围
    if (date && startDate && startDate >= date) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '结束时间必须大于开始时间',
      })
    }
  }

  return (
    <div className={cn('flex items-center gap-2 border rounded-md', className)}>
      <SingleDateTimePicker
        value={startDate}
        onChange={handleStartDateChange}
        label="开始时间"
        isOpen={startOpen}
        onOpenChange={setStartOpen}
      />
      
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      
      <SingleDateTimePicker
        value={endDate}
        onChange={handleEndDateChange}
        label="结束时间"
        isOpen={endOpen}
        onOpenChange={setEndOpen}
      />
    </div>
  )
}

export default DateTimeRangePicker

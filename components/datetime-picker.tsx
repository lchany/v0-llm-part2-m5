'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { format, zhCN } from 'date-fns'

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

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder = '选择日期时间' }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState({
    hours: value ? value.getHours().toString().padStart(2, '0') : '00',
    minutes: value ? value.getMinutes().toString().padStart(2, '0') : '00',
    seconds: value ? value.getSeconds().toString().padStart(2, '0') : '00',
  })

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setTime({
        hours: value.getHours().toString().padStart(2, '0'),
        minutes: value.getMinutes().toString().padStart(2, '0'),
        seconds: value.getSeconds().toString().padStart(2, '0'),
      })
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(parseInt(time.hours) || 0)
      newDate.setMinutes(parseInt(time.minutes) || 0)
      newDate.setSeconds(parseInt(time.seconds) || 0)
      setSelectedDate(newDate)
      onChange?.(newDate)
    } else {
      setSelectedDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value) || 0
    let max = 59
    if (field === 'hours') max = 23

    if (numValue > max) return

    const newTime = { ...time, [field]: value.padStart(2, '0') }
    setTime(newTime)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(newTime.hours) || 0)
      newDate.setMinutes(parseInt(newTime.minutes) || 0)
      newDate.setSeconds(parseInt(newTime.seconds) || 0)
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            formatDateTime(selectedDate)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="23"
              value={time.hours}
              onChange={(e) => handleTimeChange('hours', e.target.value)}
              className="w-16 text-center"
              placeholder="时"
            />
            <span>:</span>
            <Input
              type="number"
              min="0"
              max="59"
              value={time.minutes}
              onChange={(e) => handleTimeChange('minutes', e.target.value)}
              className="w-16 text-center"
              placeholder="分"
            />
            <span>:</span>
            <Input
              type="number"
              min="0"
              max="59"
              value={time.seconds}
              onChange={(e) => handleTimeChange('seconds', e.target.value)}
              className="w-16 text-center"
              placeholder="秒"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

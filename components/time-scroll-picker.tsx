'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TimeScrollPickerProps {
  value: number
  onChange: (value: number) => void
  max: number
  label: string
}

export function TimeScrollPicker({ value, onChange, max, label }: TimeScrollPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const itemHeight = 40
  const visibleItems = 5
  
  const items = Array.from({ length: max + 1 }, (_, i) => i)
  
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = value * itemHeight
    }
  }, [value])
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const index = Math.max(0, Math.min(max, Math.round(scrollTop / itemHeight)))
    if (index !== value) {
      onChange(index)
    }
  }
  
  const handleItemClick = (item: number) => {
    onChange(item)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: item * itemHeight,
        behavior: 'smooth'
      })
    }
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="relative w-16 h-[200px] overflow-hidden">
        {/* 选中区域高亮 */}
        <div 
          className="absolute left-0 right-0 bg-primary/10 border-y-2 border-primary pointer-events-none z-10"
          style={{ 
            top: `${(visibleItems - 1) / 2 * itemHeight}px`,
            height: `${itemHeight}px`
          }}
        />
        
        {/* 滚动容器 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-hide"
          style={{ 
            paddingTop: `${(visibleItems - 1) / 2 * itemHeight}px`,
            paddingBottom: `${(visibleItems - 1) / 2 * itemHeight}px`
          }}
        >
          {items.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center transition-all cursor-pointer select-none",
                value === item 
                  ? "text-foreground font-semibold text-lg" 
                  : "text-muted-foreground text-sm hover:text-foreground/70"
              )}
              style={{ height: `${itemHeight}px` }}
              onClick={() => handleItemClick(item)}
            >
              {String(item).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

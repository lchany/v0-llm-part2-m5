'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string>('')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <main className="flex-1 bg-muted/40 p-6">
          <div className="mx-auto max-w-7xl">
            {activeMenu === '' && (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-foreground mb-4">欢迎使用大模型质检系统</h1>
                  <p className="text-muted-foreground">请从左侧菜单选择功能</p>
                </div>
              </div>
            )}
            
            {activeMenu === 'vector-management' && (
              <div>
                <VectorManagement />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

// 导入组件
import { VectorManagement } from '@/components/vector-management'

import { NextResponse } from 'next/server'
import type { PageQueryResponse, Template } from '@/types/api'
import { getTemplates, addTemplate } from '@/lib/mock-data'

// GET - 查询模板列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    let filteredTemplates = [...getTemplates()]

    // 按名称过滤
    if (name) {
      filteredTemplates = filteredTemplates.filter((t) =>
        t.name.includes(name)
      )
    }

    // 按时间范围过滤
    if (startTime) {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.updateTime >= startTime
      )
    }
    if (endTime) {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.updateTime <= endTime
      )
    }

    const response: PageQueryResponse<Template> = {
      results: filteredTemplates,
      totalitems: filteredTemplates.length,
      status: 'success',
      resultCode: '200',
      resultDesc: '查询成功',
      message: '查询成功',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] GET /api/templates error:', error)
    return NextResponse.json(
      {
        results: [],
        totalitems: 0,
        status: 'error',
        resultCode: '500',
        resultDesc: '服务器错误',
        message: '查询失败',
      },
      { status: 500 }
    )
  }
}

// POST - 新增模板
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    addTemplate({
      name: body.name,
      prompt: body.prompt,
      description: body.description,
    })

    return NextResponse.json({
      resultCode: '200',
      resultDesc: '新增成功',
      message: '模板已成功创建',
    })
  } catch (error) {
    console.error('[API] POST /api/templates error:', error)
    return NextResponse.json(
      {
        resultCode: '500',
        resultDesc: '服务器错误',
        message: '新增失败',
      },
      { status: 500 }
    )
  }
}

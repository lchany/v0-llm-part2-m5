import { NextResponse } from 'next/server'
import { updateTemplateById, deleteTemplateById } from '@/lib/mock-data'

// PUT - 修改模板
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = Number.parseInt(id)
    const body = await request.json()

    const updated = updateTemplateById(templateId, body)
    
    if (!updated) {
      return NextResponse.json(
        {
          resultCode: '404',
          resultDesc: '模板不存在',
          message: '未找到指定模板',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      resultCode: '200',
      resultDesc: '修改成功',
      message: '模板已成功更新',
    })
  } catch (error) {
    console.error('[API] PUT /api/templates/[id] error:', error)
    return NextResponse.json(
      {
        resultCode: '500',
        resultDesc: '服务器错误',
        message: '修改失败',
      },
      { status: 500 }
    )
  }
}

// DELETE - 删除模板
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = Number.parseInt(id)

    const deleted = deleteTemplateById(templateId)
    
    if (!deleted) {
      return NextResponse.json(
        {
          resultCode: '404',
          resultDesc: '模板不存在',
          message: '未找到指定模板',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      resultCode: '200',
      resultDesc: '删除成功',
      message: '模板已成功删除',
    })
  } catch (error) {
    console.error('[API] DELETE /api/templates/[id] error:', error)
    return NextResponse.json(
      {
        resultCode: '500',
        resultDesc: '服务器错误',
        message: '删除失败',
      },
      { status: 500 }
    )
  }
}

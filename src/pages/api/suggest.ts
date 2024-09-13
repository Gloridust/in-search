// pages/api/suggest.ts
import type { NextApiRequest, NextApiResponse } from 'next'
// 你可以集成第三方建议 API，或者简单地返回一些静态建议

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query
  if (typeof q !== 'string' || q.trim() === '') {
    res.status(200).json({ suggestions: [] })
    return
  }

  // 示例：返回一些静态建议
  const sampleSuggestions = [
    `${q} 什么是`,
    `${q} 教程`,
    `${q} 免费资源`,
    `${q} 最新新闻`,
    `${q} 下载`,
  ]

  res.status(200).json({ suggestions: sampleSuggestions })
}

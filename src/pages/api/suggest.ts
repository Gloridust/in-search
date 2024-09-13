// pages/api/suggest.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type SuggestResponse = {
  suggestions: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuggestResponse | { error: string }>) {
  const { q } = req.query

  if (typeof q !== 'string' || q.trim() === '') {
    res.status(200).json({ suggestions: [] })
    return
  }

  try {
    const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`

    const response = await axios.get(suggestUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response || !response.data) {
      throw new Error('No data received from Google Suggest API')
    }

    const suggestions: string[] = response.data[1]

    res.status(200).json({ suggestions })
  } catch (error: any) {
    console.error('Error fetching suggestions:', error.message || error)
    res.status(500).json({ error: '无法获取搜索建议' })
  }
}

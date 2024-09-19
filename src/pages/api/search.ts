// pages/api/search.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import * as cheerio from 'cheerio'  // 使用星号导入

type SearchResult = {
  title: string
  link: string
  snippet: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q, page } = req.query

  if (typeof q !== 'string' || q.trim() === '') {
    res.status(400).json({ error: '查询参数 q 是必需的' })
    return
  }

  const pageNumber = typeof page === 'string' ? parseInt(page) : 1

  try {
    const start = (pageNumber - 1) * 10
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}&start=${start}`

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    const $ = cheerio.load(response.data)  // 使用 cheerio.load

    const results: SearchResult[] = []

    $('div.g').each((index, element) => {
      const titleElement = $(element).find('h3')
      const title = titleElement.text()
      const link = $(element).find('a').attr('href')
      const snippet = $(element).find('.s .st').text()

      if (title && link) {
        results.push({
          title,
          link,
          snippet,
        })
      }
    })

    res.status(200).json(results)
  } catch (error: any) {
    console.error('Error fetching search results:', error.message || error)
    res.status(500).json({ error: '无法获取搜索结果' })
  }
}

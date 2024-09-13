// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import cheerio from 'cheerio'

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
        'Accept-Language': 'en-US,en;q=0.9', // 添加语言头以避免重定向
      },
    })

    if (!response || !response.data) {
      throw new Error('No data received from Google')
    }

    console.log('Google Search HTML:', response.data)
    const $ = cheerio.load(response.data)
    const results: SearchResult[] = []

    // 根据最新的Google搜索结果页面结构调整选择器
    $('div.g').each((index, element) => {
      const title = $(element).find('h3').text()
      const link = $(element).find('a').attr('href')
      let snippet = ''

      // 更新选择器以匹配最新的snippet类名
      const snippetElement = $(element).find('div.IsZvec') // 可能需要根据Google的HTML结构调整

      if (snippetElement.length > 0) {
        snippet = snippetElement.text()
      }

      if (title && link) {
        results.push({
          title,
          link,
          snippet,
        })
      }
    })

    res.status(200).json({ results })
  } catch (error: any) {
    console.error('Error fetching search results:', error.message || error)
    res.status(500).json({ error: '无法获取搜索结果' })
  }
}

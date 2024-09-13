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

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    const $ = cheerio.load(data)
    const results: SearchResult[] = []

    $('#search .g').each((index, element) => {
      const title = $(element).find('h3').text()
      const link = $(element).find('a').attr('href')
      let snippet = ''

      const snippetElement = $(element).find('.VwiC3b.yXK7lf.lVm3ye.r025kc.hJNv6b.Hdw6tb')

      if (snippetElement.length > 0) {
        snippet = snippetElement
          .map((i, el) => $(el).text())
          .get()
          .join(' ')
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
  } catch (error) {
    console.error('Error fetching search results:', error)
    res.status(500).json({ error: '无法获取搜索结果' })
  }
}

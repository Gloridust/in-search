// pages/search.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

type SearchResult = {
  title: string
  link: string
  snippet: string
}

const SearchPage = () => {
  const router = useRouter()
  const { q, page } = router.query
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const currentPage = typeof page === 'string' ? parseInt(page) : 1

  useEffect(() => {
    const fetchResults = async () => {
      if (typeof q !== 'string' || q.trim() === '') return
      setLoading(true)
      try {
        const response = await axios.get(`/api/search?q=${encodeURIComponent(q)}&page=${currentPage}`)
        setResults(response.data.results)
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
      setLoading(false)
    }

    fetchResults()
  }, [q, currentPage])

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(q as string)}&page=${newPage}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">加载中...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-4">搜索结果：{q}</p>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xl font-semibold">
                    {result.title}
                  </a>
                  <p className="text-gray-700 mt-2">{result.snippet}</p>
                </div>
              ))}
            </div>
            {/* 分页控件 */}
            <div className="flex justify-center mt-8 space-x-4">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  上一页
                </button>
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                下一页
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage

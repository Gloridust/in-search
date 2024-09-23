// pages/search.tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'

type SearchResult = {
  title: string
  link: string
  snippet: string
  icon: string
}

const SearchPage = () => {
  const router = useRouter()
  const { q, page } = router.query
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(false)
  const currentPage = typeof page === 'string' ? parseInt(page) : 1

  useEffect(() => {
    const storedProxyEnabled = localStorage.getItem('proxyEnabled')
    setProxyEnabled(storedProxyEnabled === 'true')

    const fetchResults = async () => {
      if (typeof q !== 'string' || q.trim() === '') {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const response = await axios.get(`/api/search?q=${encodeURIComponent(q)}&page=${currentPage}`)
        if (Array.isArray(response.data)) {
          setResults(response.data)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
        setResults([])
      }
      setLoading(false)
    }

    fetchResults()
  }, [q, currentPage])

  useEffect(() => {
    const handleStorageChange = () => {
      const storedProxyEnabled = localStorage.getItem('proxyEnabled')
      setProxyEnabled(storedProxyEnabled === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(q as string)}&page=${newPage}`)
  }

  const getProxyUrl = (originalUrl: string) => {
    // 移除 "https://" 或 "http://" 前缀（如果存在）
    originalUrl = originalUrl.replace(/^(https?:\/\/)/, '');
    
    // 移除尾部的斜杠（如果存在）
    originalUrl = originalUrl.replace(/\/$/, '');
    
    // 构造代理 URL
    return `https://webproxy.innovisle.net/${originalUrl}`;
  };
  
  return (
    <>
      <Head>
        <title>搜索结果 - inSearch</title>
        <meta name="description" content={`搜索关键词: ${q}`} />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">加载中...</p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">搜索结果：{q}</p>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <a
                    key={index}
                    href={proxyEnabled ? getProxyUrl(result.link) : result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex items-center">
                      {result.icon && (
                        <Image
                          src={result.icon}
                          alt="icon"
                          width={24}
                          height={24}
                          className="mr-2 rounded-full"
                        />
                      )}
                      <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                        {result.title}
                      </div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      {result.link}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{result.snippet}</p>
                  </a>
                ))}
              </div>
              {/* 分页控件 */}
              <div className="flex justify-center mt-8 space-x-4">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1.5 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition"
                  >
                    上一页
                  </button>
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1.5 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition"
                >
                  下一页
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchPage

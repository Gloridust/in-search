// pages/search.tsx

import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { FaSearch } from 'react-icons/fa'

type SearchResult = {
  title: string
  link: string
  snippet: string
  icon: string
}

const SearchPage = () => {
  const router = useRouter()
  const { q, page } = router.query
  const [query, setQuery] = useState(q as string || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const currentPage = typeof page === 'string' ? parseInt(page) : 1
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length === 0) {
        setSuggestions([])
        return
      }
      try {
        const response = await axios.get(`/api/suggest?q=${encodeURIComponent(query)}`)
        if (response.data && response.data.suggestions) {
          setSuggestions(response.data.suggestions)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      }
    }

    const debounceFetch = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounceFetch)
  }, [query])

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(q as string)}&page=${newPage}`)
  }

  const getProxyUrl = (originalUrl: string) => {
    originalUrl = originalUrl.replace(/^(https?:\/\/)/, '')
    return `https://webproxy.innovisle.net/?url=${originalUrl}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestion((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      if (selectedSuggestion >= 0) {
        handleSuggestionClick(suggestions[selectedSuggestion])
      } else {
        handleSubmit(e)
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // 使用setTimeout来延迟隐藏建议列表，以便点击事件可以先触发
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <>
      <Head>
        <title>搜索结果 - inSearch</title>
        <meta name="description" content={`搜索关键词: ${q}`} />
      </Head>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative mx-auto">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="搜索..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className={`px-4 py-2 cursor-pointer transition ${
                        selectedSuggestion === index ? 'bg-blue-100 dark:bg-gray-700' : 'hover:bg-blue-50 dark:hover:bg-gray-600'
                      } dark:text-white`}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
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

// pages/index.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaSearch } from 'react-icons/fa'
import axios from 'axios'
import Head from 'next/head'

const Home = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1)
  const router = useRouter()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  return (
    <>
      <Head>
        <title>inSearch - 简洁搜索引擎</title>
        <meta name="description" content="inSearch 是一个简洁、高效的搜索引擎，提供纯净的搜索体验。" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl -mt-24">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-8 text-center">inSearch</h1>
          <form onSubmit={handleSubmit} className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pl-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="搜索..."
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-2 shadow-lg z-10 max-h-60 overflow-y-auto">
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
      </div>
    </>
  )
}

export default Home

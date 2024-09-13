// pages/index.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaSearch } from 'react-icons/fa'
import axios from 'axios'

const Home = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length === 0) {
        setSuggestions([])
        return
      }
      try {
        // 假设后端有一个建议接口
        const response = await axios.get(`/api/suggest?q=${encodeURIComponent(query)}`)
        setSuggestions(response.data.suggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    }

    const debounceFetch = setTimeout(() => {
      fetchSuggestions()
    }, 300) // 防抖延迟

    return () => clearTimeout(debounceFetch)
  }, [query])

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-24 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">inSearch</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="搜索..."
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-2 shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition transform hover:scale-105"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  )
}

export default Home

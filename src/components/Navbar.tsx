// components/Navbar.tsx
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'

const Navbar = () => {
  const [proxyEnabled, setProxyEnabled] = useState(false)

  useEffect(() => {
    const storedProxyEnabled = localStorage.getItem('proxyEnabled')
    setProxyEnabled(storedProxyEnabled === 'true')
  }, [])

  const toggleProxy = () => {
    const newProxyEnabled = !proxyEnabled
    setProxyEnabled(newProxyEnabled)
    localStorage.setItem('proxyEnabled', newProxyEnabled.toString())
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg w-11/12 max-w-4xl z-50">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
          inSearch
        </Link>

        <div className="flex w-full justify-between items-center sm:justify-end space-x-4">
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition text-sm sm:text-base">
              搜索
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition text-sm sm:text-base">
              关于
            </Link>
          </div>

          <div className="flex items-center">
            <span className="mr-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">代理访问</span>
            <Switch
              checked={proxyEnabled}
              onChange={toggleProxy}
              className={`${
                proxyEnabled ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-200 dark:bg-gray-600'
              } relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800`}
            >
              <span
                className={`${
                  proxyEnabled ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                } inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

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
    // 触发一个自定义事件，以便其他组件可以监听到变化
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-full px-6 py-2 shadow-lg flex justify-between items-center w-4/5 max-w-4xl z-50">
      <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
        inSearch
      </Link>
      <div className="flex space-x-6 items-center">
        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition">
          搜索
        </Link>
        <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition">
          关于
        </Link>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">代理访问</span>
          <Switch
            checked={proxyEnabled}
            onChange={toggleProxy}
            className={`${
              proxyEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                proxyEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

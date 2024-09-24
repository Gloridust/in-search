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
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg flex justify-between items-center w-11/12 max-w-4xl z-50">
      {/* 使用隐藏类在小屏幕上隐藏 logo */}
      <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
        inSearch
      </Link>

      <div className="flex space-x-4 items-center">
        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition text-sm sm:text-base">
          搜索
        </Link>
        <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition text-sm sm:text-base">
          关于
        </Link>
        
        {/* 在移动端隐藏 Switch，调整布局 */}
        <div className="flex items-center">
          <span className="mr-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">代理访问</span>
          <Switch
            checked={proxyEnabled}
            onChange={toggleProxy}
            className={`${
              proxyEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                proxyEnabled ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
              } inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

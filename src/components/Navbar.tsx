// components/Navbar.tsx
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-full px-6 py-2 shadow-lg flex justify-between items-center w-4/5 max-w-4xl">
      <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
        inSearch
      </Link>
      <div className="flex space-x-6">
        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition">
          搜索
        </Link>
        <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition">
          关于
        </Link>
      </div>
    </nav>
  )
}

export default Navbar

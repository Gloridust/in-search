// components/Navbar.tsx
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-full px-6 py-2 shadow-lg flex justify-between items-center w-auto max-w-4xl">
      <Link href="/">
        <a className="text-xl font-bold text-gray-800">inSearch</a>
      </Link>
      <div className="flex space-x-4">
        <Link href="/">
          <a className="text-gray-600 hover:text-gray-800 transition">搜索</a>
        </Link>
        <Link href="/about">
          <a className="text-gray-600 hover:text-gray-800 transition">关于</a>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar

// components/Footer.tsx

import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="w-full py-4 text-center text-sm bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
      <p>
        © {new Date().getFullYear()} inSearch. 
        <Link href="https://github.com/Gloridust/in-search" className="ml-1 hover:text-blue-500 transition-colors">
          GitHub
        </Link>
      </p>
    </footer>
  )
}

export default Footer

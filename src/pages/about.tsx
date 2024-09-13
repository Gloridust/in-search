// pages/about.tsx
import Link from 'next/link'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">关于 inSearch</h2>
        <p className="text-gray-700 mb-4">
          inSearch 是一个旨在为无法访问 Google 的用户提供纯净搜索体验的搜索引擎。我们采用简约、扁平化的设计，确保用户在搜索时拥有高效且愉悦的体验。
        </p>
        <p className="text-gray-700 mb-4">
          后台依赖于 Google 的接口，确保搜索结果的准确性和全面性。inSearch 专注于提供最相关的网页搜索结果，同时保持界面的简洁和响应速度。
        </p>
        <p className="text-gray-700 mb-4">
          感谢您使用 inSearch，希望我们的服务能够满足您的需求。
        </p>
        <Link href="/">
          <a className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            返回首页
          </a>
        </Link>
      </div>
    </div>
  )
}

export default About

// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${roboto.className} flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="keywords" content="搜索引擎, inSearch, 简洁搜索, 高效搜索" />
        <meta name="description" content="inSearch 是一个简洁、高效的搜索引擎，提供纯净的搜索体验。" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="inSearch" />
        <meta property="og:locale" content="zh_CN" />
      </Head>
      <Navbar />
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

export default MyApp

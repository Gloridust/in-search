// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${roboto.className} flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <Navbar />
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

export default MyApp

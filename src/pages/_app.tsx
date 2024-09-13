// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'
import Navbar from '../components/Navbar'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={roboto.className}>
      <Navbar />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp

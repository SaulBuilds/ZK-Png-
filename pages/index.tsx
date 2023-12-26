import Image from 'next/image'
import { Inter } from 'next/font/google'
import { ZkLanding } from '@/components/zk-landing'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
   <>
   <ZkLanding />
   </>
  )
}

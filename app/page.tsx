import { Button } from '@/components/ui/button'
import { Users, Play, Headphones } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from './components/Navbar'
import { Redirect } from './components/Redirect'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <Redirect />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-900 to-blue-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Let Your Fans Choose the Beat
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                FanTune: Where creators and fans shape the music stream
                together.
              </p>
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                Get Started
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-8">
              Why FanTune?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Fan Engagement</h3>
                <p className="text-gray-400">
                  Let fans influence your music choices.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Play className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Live Streaming</h3>
                <p className="text-gray-400">
                  High-quality, low-latency streaming.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Headphones className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Music Discovery</h3>
                <p className="text-gray-400">
                  Expand musical horizons together.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-gray-900">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-4">
              Ready to Transform Your Streams?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-400 md:text-lg mb-8">
              Join FanTune today and create unforgettable music experiences.
            </p>
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>
      <footer className="py-6 w-full px-4 md:px-6 border-t border-gray-800">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © 2024 FanTune. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link
              className="text-xs text-gray-500 hover:text-gray-400"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-xs text-gray-500 hover:text-gray-400"
              href="#"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

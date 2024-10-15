'use client'

import { Button } from '@/components/ui/button'
import { Users, Play, Headphones } from 'lucide-react'
import { Redirect } from './components/Redirect'
import { useSession, signIn } from 'next-auth/react'

export default function LandingPage() {
  const session = useSession()

  const getStarted = () => {
    if (!session?.data?.user) {
      signIn()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <Redirect />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
                Let Your Fans Choose the Beat
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl">
                Play-Me: Where creators and fans shape the music stream
                together.
              </p>
              <Button
                onClick={getStarted}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-8 text-white drop-shadow-lg">
              Why Play-Me?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">
                  Fan Engagement
                </h3>
                <p className="text-gray-300">
                  Let fans influence your music choices.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Play className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">
                  Live Streaming
                </h3>
                <p className="text-gray-300">
                  High-quality, low-latency streaming.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Headphones className="h-12 w-12 text-indigo-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">
                  Music Discovery
                </h3>
                <p className="text-gray-300">
                  Expand musical horizons together.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-4 text-white drop-shadow-lg">
              Ready to Transform Your Streams?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-300 md:text-lg mb-8">
              Join Play-Me today and create unforgettable music experiences.
            </p>
            <Button
              onClick={getStarted}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
            >
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>
      <footer className="py-6 w-full px-4 md:px-6 border-t border-gray-700">
        <div className="container flex flex-col justify-center items-center">
          <p className="text-xs text-gray-400">
            © 2024 Play-Me. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

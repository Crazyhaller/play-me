'use client'

import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'

export function Navbar() {
  const session = useSession()
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 md:px-6 py-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-gray-200 z-50 shadow-lg">
      <div className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
        Play-Me
      </div>
      <div>
        {session.data?.user ? (
          <Button
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base shadow-lg"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base shadow-lg"
            onClick={() => signIn()}
          >
            SignIn
          </Button>
        )}
      </div>
    </div>
  )
}

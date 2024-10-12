'use client'

import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'

export function Navbar() {
  const session = useSession()
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 md:px-6 py-4 bg-[rgb(18,10,10)] text-gray-200 z-50">
      <div className="text-lg font-bold text-white">Play-Me</div>
      <div>
        {session.data?.user ? (
          <Button
            className="bg-purple-700 hover:bg-purple-900 text-white"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="bg-purple-700 hover:bg-purple-900 text-white"
            onClick={() => signIn()}
          >
            SignIn
          </Button>
        )}
      </div>
    </div>
  )
}

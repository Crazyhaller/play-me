'use client'
import { useEffect, useState } from 'react'
import StreamView from '../components/StreamView'

export default function Component() {
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user')
        const data = await response.json()
        console.log('User data:', data)
        console.log('User id:', data.user?.id)
        setCreatorId(data.user?.id || null)
      } catch (e) {
        console.error('Error fetching user data:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-neon-blue text-2xl font-bold">
        Loading...
      </div>
    )
  }

  return <StreamView creatorId={creatorId!} playVideo={true} />
}

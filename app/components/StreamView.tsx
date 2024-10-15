/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronUp, ChevronDown, Play, Share2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { YT_REGEX } from '../lib/utils'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
//@ts-ignore
import YouTubePlayer from 'youtube-player'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Video {
  id: string
  type: string
  url: string
  extractedId: string
  title: string
  smallImg: string
  bigImg: string
  active: boolean
  userId: string
  upvotes: number
  haveUpvoted: boolean
}

interface CustomSession extends Session {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const REFRESH_INTERVAL_MS = 10 * 1000

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string
  playVideo: boolean
}) {
  const [inputUrl, setInputUrl] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(false)
  const [playNextLoader, setPlayNextLoader] = useState(false)
  const videoPlayerRef = useRef<HTMLDivElement>()
  const { data: session } = useSession() as { data: CustomSession | null }
  const [creatorUserId, setCreatorUserId] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (!session?.user) {
      router.push('/')
    }
  }, [session])

  async function refreshStreams() {
    try {
      const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (json.streams && Array.isArray(json.streams)) {
        setQueue(
          json.streams.length > 0
            ? json.streams.sort((a: any, b: any) => b.upvotes - a.upvotes)
            : []
        )
      } else {
        setQueue([])
      }

      setCurrentVideo((video) => {
        if (video?.id === json.activeStream?.stream?.id) {
          return video
        }
        return json.activeStream?.stream || null
      })

      // Set the creator's ID
      setCreatorUserId(json.creatorUserId)
      setIsCreator(json.isCreator)
    } catch (error) {
      console.error('Error refreshing streams:', error)
      setQueue([])
      setCurrentVideo(null)
    }
  }

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [creatorId])

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo) return

    const player = YouTubePlayer(videoPlayerRef.current)
    player.loadVideoById(currentVideo.extractedId)
    player.playVideo()

    const eventHandler = (event: { data: number }) => {
      if (event.data === 0) {
        playNext()
      }
    }
    player.on('stateChange', eventHandler)

    return () => {
      player.destroy()
    }
  }, [currentVideo, videoPlayerRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) {
      toast.error('YouTube Link Cannot Be Empty')
      return
    }
    if (!inputUrl.match(YT_REGEX)) {
      toast.error('Invalid YouTube URL Format')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/streams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          url: inputUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'An Error Occurred')
      }
      setQueue([...queue, data])
      setInputUrl('')
      toast.success('Song Added To Queue')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An Unexpected Error Occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                haveUpvoted: !video.haveUpvoted,
              }
            : video
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    )

    fetch(`/api/streams/${isUpvote ? 'upvote' : 'downvote'}`, {
      method: 'POST',
      body: JSON.stringify({
        streamId: id,
      }),
    })
  }

  const playNext = async () => {
    if (queue.length > 0) {
      try {
        setPlayNextLoader(true)
        const data = await fetch('/api/streams/next', {
          method: 'GET',
        })
        const json = await data.json()
        setCurrentVideo(json.stream)
        setQueue((q) => q.filter((x) => x.id !== json.stream?.id))
      } catch (e) {
        console.error('Error Playing Next Song:', e)
      } finally {
        setPlayNextLoader(false)
      }
    }
  }

  const handleShare = () => {
    const shareableLink = `${window.location.origin}/creator/${creatorId}`
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        toast.success('Link Copied To Clipboard!')
      },
      (err) => {
        console.error('Could not copy text: ', err)
        toast.error('Failed To Copy Link. Please Try Again.')
      }
    )
  }

  const removeSong = async (streamId: string) => {
    try {
      const res = await fetch('/api/streams/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId }),
      })
      if (res.ok) {
        toast.success('Song Removed Successfully')
        refreshStreams()
      } else {
        toast.error('Failed To Remove Song')
      }
    } catch (error) {
      toast.error('Failed To Remove Song')
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <div className="container mx-auto p-4 space-y-6 mt-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-white text-center md:text-left drop-shadow-lg">
                  Song Voting Queue
                </h1>
                <Button
                  onClick={handleShare}
                  className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter a YouTube URL"
                  className="text-black w-full"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
                >
                  {loading ? 'Loading...' : 'Add to Queue'}
                </Button>
              </form>

              {inputUrl && inputUrl.match(YT_REGEX) && !loading && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <LiteYouTubeEmbed
                      id={inputUrl.split('?v=')[1]}
                      title="YouTube video"
                      noCookie={true}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  Now Playing
                </h2>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    {currentVideo ? (
                      <div>
                        {playVideo ? (
                          <>
                            {/* @ts-expect-error */}
                            <div ref={videoPlayerRef} className="w-full" />
                          </>
                        ) : (
                          <>
                            <Image
                              src={currentVideo.bigImg}
                              alt="Current Video"
                              className="w-full h-72 object-cover rounded"
                              width={640}
                              height={360}
                            />
                            <p className="mt-2 text-center font-semibold text-white drop-shadow-lg">
                              {currentVideo.title}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-400">
                        No video playing
                      </p>
                    )}
                  </CardContent>
                </Card>
                {playVideo && (
                  <Button
                    disabled={playNextLoader}
                    onClick={playNext}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
                  >
                    <Play className="mr-2 h-4 w-4" />{' '}
                    {playNextLoader ? 'Loading...' : 'Play Next'}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                Upcoming Songs
              </h2>
              {queue.length === 0 && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white drop-shadow-lg">
                        No songs in queue
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              )}
              {queue.map((video) => (
                <Card key={video.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <Image
                      src={video.smallImg}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-38 h-20 object-cover rounded"
                      width={100}
                      height={100}
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white drop-shadow-lg">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVote(
                              video.id,
                              video.haveUpvoted ? false : true
                            )
                          }
                          className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                          {video.haveUpvoted ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          <span>{video.upvotes}</span>
                        </Button>
                      </div>
                    </div>
                    {isCreator && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSong(video.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
        />
      </div>
    </>
  )
}

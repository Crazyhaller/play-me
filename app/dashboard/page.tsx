'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronUp, ChevronDown, Play, Share2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navbar } from '../components/Navbar'

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

const REFRESH_INTERVAL_MS = 10 * 1000

export default function Component() {
  const [inputUrl, setInputUrl] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

  async function refreshStreams() {
    const res = await fetch('/api/streams/my', {
      credentials: 'include',
    })
    const json = await res.json()
    setQueue(json.streams)
  }

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(() => {}, REFRESH_INTERVAL_MS)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newVideo: Video = {
      id: String(queue.length + 1),
      title: `New Song ${queue.length + 1}`,
      upvotes: 0,
    }
    setQueue([...queue, newVideo])
    setInputUrl('')
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
      body: JSON.stringify({ streamId: id }),
    })
  }

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0])
      setQueue(queue.slice(1))
    }
  }

  const handleShare = () => {
    const shareLink = window.location.href
    navigator.clipboard.writeText(shareLink).then(
      () => {
        toast.success('Link copied to clipboard', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      },
      (err) => {
        console.log(err)

        toast.error('Failed to copy link to clipboard', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(18,10,10)] text-gray-200">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Song Voting Queue</h1>
          <Button
            onClick={handleShare}
            className="bg-purple-700 hover:bg-purple-900 text-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter a YouTube URL"
          />
          <Button
            type="submit"
            className="bg-purple-700 hover:bg-purple-900 text-white"
          >
            Add To Queue
          </Button>
        </form>

        {inputUrl && (
          <Card className="bg-gray-900 border-gray-900">
            <CardContent className="p-4">
              <img
                src="/placeholder.svg?height=200&width=320"
                alt="Video Preview"
                className="rounded-lg w-full h-48 object-cover"
              />
              <p className="mt-2 text-center text-gray-400">Video Preview</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Now Playing</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              {currentVideo ? (
                <>
                  <img
                    src="/placeholder.svg?height=360&width=640"
                    alt="Current Video"
                    className="w-full h-72 object-cover rounded"
                  />
                  <p className="mt-2 text-center font-semibold text-white">
                    {currentVideo.title}
                  </p>
                </>
              ) : (
                <p className="text-center py-8 text-gray-400">
                  No video playing
                </p>
              )}
            </CardContent>
          </Card>
          <Button
            onClick={playNext}
            className="w-full bg-purple-700 hover:bg-purple-900 text-white"
          >
            <Play className="mr-2 h-4 w-4" /> Play Next
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Upcoming Songs</h2>
          {queue.map((video) => {
            ;<Card key={video.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 flex items-center space-x-4">
                <img
                  src={video.smallImg}
                  alt={`Thumnail for ${video.title}`}
                  className="w-38 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-white">{video.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleVote(video.id, video.haveUpvoted ? false : true)
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
              </CardContent>
            </Card>
          })}
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
  )
}

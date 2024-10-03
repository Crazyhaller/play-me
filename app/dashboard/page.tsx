'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronUp, ChevronDown, Play } from 'lucide-react'

const fetchVideoDetails = async (url: string) => {
  return {
    title: 'Mock Video Title',
    thumbnail: '/placeholder.svg?height=90&width=120',
    id: url.split('v=')[1],
  }
}

interface Video {
  id: string
  title: string
  thumbnail: string
  upvotes: number
  downvotes: number
}

const sampleSongs: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    thumbnail: '/placeholder.svg?height=90&width=120',
    upvotes: 20,
    downvotes: 5,
  },
  {
    id: 'y6120QOlsfU',
    title: 'Darude - Sandstorm',
    thumbnail: '/placeholder.svg?height=90&width=120',
    upvotes: 15,
    downvotes: 3,
  },
  {
    id: 'L_jWHffIx5E',
    title: 'Smash Mouth - All Star',
    thumbnail: '/placeholder.svg?height=90&width=120',
    upvotes: 12,
    downvotes: 2,
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE',
    thumbnail: '/placeholder.svg?height=90&width=120',
    upvotes: 10,
    downvotes: 2,
  },
]

export default function Dashboard() {
  const [inputUrl, setInputUrl] = useState('')
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null)
  const [queue, setQueue] = useState<Video[]>(sampleSongs)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

  useEffect(() => {
    if (inputUrl) {
      fetchVideoDetails(inputUrl).then((details) =>
        setPreviewVideo({ ...details, upvotes: 0, downvotes: 0 })
      )
    } else {
      setPreviewVideo(null)
    }
  }, [inputUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (previewVideo) {
      setQueue([...queue, previewVideo])
      setInputUrl('')
      setPreviewVideo(null)
    }
  }

  const handleVote = (index: number, isUpvote: boolean) => {
    const newQueue = [...queue]
    if (isUpvote) {
      newQueue[index].upvotes += 1
    } else {
      newQueue[index].downvotes += 1
    }
    newQueue.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
    setQueue(newQueue)
  }

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0])
      setQueue(queue.slice(1))
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Song Voting Queue
        </h1>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="text"
            placeholder="Enter YouTube URL"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/50"
          />
          <Button
            type="submit"
            disabled={!previewVideo}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Add to Queue
          </Button>
        </form>

        {previewVideo && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="flex items-center space-x-4 p-4">
              <img
                src={previewVideo.thumbnail}
                alt={previewVideo.title}
                className="w-24 h-18 object-cover"
              />
              <div>
                <h3 className="font-semibold text-white">
                  {previewVideo.title}
                </h3>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Upcoming Songs</h2>
          {queue.map((video, index) => (
            <Card key={video.id} className="bg-white/10 border-white/20">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-18 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{video.title}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      onClick={() => handleVote(index, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2ch] text-center">
                      {video.upvotes}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      onClick={() => handleVote(index, false)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2ch] text-center">
                      {video.downvotes}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-white/10 border-white/20">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
            {currentVideo ? (
              <div className="space-y-4">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentVideo.id}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="flex items-center space-x-4">
                  <img
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    className="w-24 h-18 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      {currentVideo.title}
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              <p>No video currently playing</p>
            )}
            <Button
              onClick={playNext}
              disabled={queue.length === 0}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" /> Play Next
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

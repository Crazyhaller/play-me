import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '../../lib/db'
import { YT_REGEX } from '@/app/lib/utils'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import youtubesearchapi from 'youtube-search-api'
import { getServerSession } from 'next-auth'

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? '',
      },
    })
    if (!user) {
      return NextResponse.json(
        {
          message: 'Unauthenticated',
        },
        {
          status: 403,
        }
      )
    }

    const data = CreateStreamSchema.parse(await req.json())

    if (!data.url.trim()) {
      return NextResponse.json(
        {
          message: 'YouTube link cannot be empty',
        },
        {
          status: 400,
        }
      )
    }

    const isYoutube = data.url.match(YT_REGEX)

    if (!isYoutube) {
      return NextResponse.json(
        {
          message: 'Invalid URL',
        },
        { status: 400 }
      )
    }

    // Check if the user is not the creator
    if (user.id !== data.creatorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      const recentStreams = await prismaClient.stream.findMany({
        where: {
          userId: data.creatorId,
          createdAt: {
            gte: tenMinutesAgo,
          },
        },
      })
      // Check for duplicate song in the last 10 minutes
      const duplicateSong = recentStreams.find(
        (stream) => stream.extractedId === extractedId
      )
      if (duplicateSong) {
        return NextResponse.json(
          {
            message: 'This song was already added in the last 10 minutes',
          },
          {
            status: 429,
          }
        )
      }
      // Rate limiting checks for non-creator users
      const userStreams = recentStreams.filter(
        (stream) => stream.userId === user.id
      )
      const streamsLastTwoMinutes = userStreams.filter(
        (stream) => stream.createdAt >= twoMinutesAgo
      )
      if (streamsLastTwoMinutes.length >= 2) {
        return NextResponse.json(
          {
            message:
              'Rate limit exceeded: You can only add 2 songs per 2 minutes',
          },
          {
            status: 429,
          }
        )
      }
      if (recentStreams.length >= 5) {
        return NextResponse.json(
          {
            message:
              'Rate limit exceeded: You can only add 5 songs per 10 minutes',
          },
          {
            status: 429,
          }
        )
      }
    }

    const extractedId = data.url.split('?v=')[1]
    const res = await youtubesearchapi.GetVideoDetails(extractedId)

    const thumbnails = res.thumbnail.thumbnails
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    )

    const existingActiveStreams = await prismaClient.stream.count({
      where: {
        userId: data.creatorId,
        played: false,
      },
    })

    if (existingActiveStreams >= 30) {
      return NextResponse.json(
        {
          message: 'Queue is full',
        },
        {
          status: 429,
        }
      )
    }

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: 'Youtube',
        title: res.title ?? "WOOPS! Couldn't Fetch The Title",
        smallImg:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url ??
              'https://static.vecteezy.com/system/resources/thumbnails/022/007/572/small_2x/funny-cute-banana-character-design-generative-ai-photo.jpeg',
        bigImg:
          thumbnails[thumbnails.length - 1].url ??
          'https://static.vecteezy.com/system/resources/thumbnails/022/007/572/small_2x/funny-cute-banana-character-design-generative-ai-photo.jpeg',
      },
    })

    return NextResponse.json({
      ...stream,
      hasUpvoted: false,
      upvotes: 0,
    })
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      {
        message: 'Error while adding the stream',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get('creatorId')
  const session = await getServerSession()

  // TODO: You can get rid of the DB call here
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? '',
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        message: 'Unauthenticated',
      },
      {
        status: 403,
      }
    )
  }

  if (!creatorId) {
    return NextResponse.json(
      {
        message: 'Invalid creatorId',
      },
      { status: 411 }
    )
  }

  const [streams, activeStream] = await Promise.all([
    await prismaClient.stream.findMany({
      where: {
        userId: creatorId ?? '',
        played: false,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    await prismaClient.currentStream.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ])

  const isCreator = user.id === creatorId

  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
    isCreator,
    creatorId,
  })
}

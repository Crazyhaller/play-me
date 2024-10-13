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
    const data = CreateStreamSchema.parse(await req.json())

    const isYoutube = data.url.match(YT_REGEX)

    if (!isYoutube) {
      return NextResponse.json(
        {
          message: 'Invalid URL',
        },
        { status: 411 }
      )
    }

    const extractedId = data.url.split('?v=')[1]
    const res = await youtubesearchapi.GetVideoDetails(extractedId)
    const thumbnails = res.thumbnail.thumbnails
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    )

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
      { status: 411 }
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

  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  })
}

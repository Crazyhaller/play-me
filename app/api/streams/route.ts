import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '../../lib/db'
import { YT_REGEX } from '@/app/lib/utils'

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
})

export async function POST(req: NextResponse) {
  try {
    const data = CreateStreamSchema.parse(await req.json())

    const isYoutube = YT_REGEX.test(data.url)
    if (!isYoutube) {
      return NextResponse.json(
        {
          message: 'Invalid URL',
        },
        { status: 411 }
      )
    }

    const extractedId = data.url.split('?v=')[1]

    prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: 'Youtube',
      },
    })
  } catch (e) {
    return NextResponse.json(
      {
        message: 'Error while adding the stream',
      },
      { status: 411 }
    )
  }
}

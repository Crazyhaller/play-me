'use client'

import StreamView from '../components/StreamView'

// const REFRESH_INTERVAL_MS = 10 * 1000
const creatorId = '68c1f567-a1e1-433e-94a4-5fca07051434'

export default function Component() {
  return <StreamView creatorId={creatorId} playVideo={true} />
}

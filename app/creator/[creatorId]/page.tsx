import StreamView from '@/app/components/StreamView'

export default function Creator({
  params: { creatorId },
}: {
  params: { creatorId: string }
}) {
  return <StreamView creatorId={creatorId} />
}

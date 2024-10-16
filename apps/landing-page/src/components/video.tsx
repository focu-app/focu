import { Suspense } from 'react'
import { list } from '@vercel/blob'
 

export async function Video({ fileName }: { fileName: string }) {
  const { blobs } = await list({
    prefix: fileName,
    limit: 1,
  })
  const { url } = blobs[0]
 
  return (
    <video controls preload="metadata" aria-label="Video player" muted playsInline width={720} className="rounded-lg">
      <source src={`${url}#t=0.1`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

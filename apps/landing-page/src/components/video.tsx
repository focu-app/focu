import { list } from "@vercel/blob";
import { Suspense } from "react";

export async function Video({
  fileName,
  autoPlay = false,
}: { fileName: string; autoPlay?: boolean }) {
  const { blobs } = await list({
    prefix: fileName,
    limit: 1,
  });
  const { url } = blobs[0];

  return (
    <video
      controls
      preload="metadata"
      aria-label="Video player"
      muted
      playsInline
      width={960}
      className="rounded-lg"
      autoPlay={autoPlay}
    >
      <source src={`${url}#t=0.1`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

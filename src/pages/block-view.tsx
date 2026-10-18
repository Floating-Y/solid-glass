import * as React from "react"
import { useParams } from "react-router-dom"

import { blocks } from "@/blocks"
import { Toaster } from "@/components/ui/sonner"

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

/** A block by itself, filling the window: what the frame on the Blocks page shows. */
export default function BlockView() {
  const { name } = useParams()
  const block = blocks.find((entry) => entry.name === name)
  if (!block) return null
  return (
    // shadcn/ui's blocks ask for their pictures from the root of the site ("/placeholder.svg"). Where
    // the site lives under a path, one that was not found there is asked for again under that path.
    <div
      className="contents"
      onErrorCapture={(event) => {
        const image = event.target
        if (!(image instanceof HTMLImageElement) || image.dataset.retried) return
        image.dataset.retried = "1"
        image.src = `${base}/placeholder.svg`
      }}
    >
      <React.Suspense fallback={<div role="status" className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading preview…</div>}>
        <block.component />
      </React.Suspense>
      <Toaster />
    </div>
  )
}

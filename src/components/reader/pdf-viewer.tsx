'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Maximize, ZoomIn, ZoomOut } from 'lucide-react'
import { updateReadingProgress, recordResourceView } from '@/app/actions/library'

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  resourceId: string
  initialPage: number
}

export default function PDFViewer({ resourceId, initialPage }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage || 1)
  const [scale, setScale] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track if we've recorded the view
  const [hasRecordedView, setHasRecordedView] = useState(false)

  useEffect(() => {
    if (!hasRecordedView) {
      recordResourceView(resourceId)
      setHasRecordedView(true)
    }
  }, [resourceId, hasRecordedView])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function changePage(offset: number) {
    const newPage = pageNumber + offset
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      updateReadingProgress(resourceId, newPage)
    }
  }

  function handleJumpToPage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const target = parseInt(formData.get('page') as string)
    if (target >= 1 && target <= numPages) {
      setPageNumber(target)
      updateReadingProgress(resourceId, target)
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div ref={containerRef} className={`flex flex-col items-center bg-zinc-950 ${isFullscreen ? 'h-screen w-screen justify-center' : 'min-h-[calc(100vh-4rem)] rounded-xl overflow-hidden shadow-2xl border border-border/20'}`}>
      {/* Toolbar */}
      <div className="w-full bg-zinc-900 border-b border-zinc-800 p-3 flex flex-wrap items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-zinc-400 text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.2))} className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
            <Input 
              name="page" 
              type="number" 
              min={1} 
              max={numPages || 1} 
              defaultValue={pageNumber}
              key={pageNumber} // Force re-render of defaultValue when pageNumber changes externally
              className="w-16 h-9 text-center bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <span className="text-zinc-400 text-sm">of {numPages || '--'}</span>
          </form>

          <Button variant="outline" size="icon" onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto w-full flex justify-center p-4 custom-scrollbar">
        <Document
          file={`/api/pdf/${resourceId}`}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full text-zinc-400">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Decrypting secure resource...</p>
              </div>
            </div>
          }
          error={
            <div className="text-destructive text-center p-8 bg-destructive/10 rounded-xl">
              Failed to load resource. You may not have access or the file is missing.
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={false} // Prevents text selection more thoroughly
            renderAnnotationLayer={false}
            className="shadow-2xl"
          />
        </Document>
      </div>
    </div>
  )
}

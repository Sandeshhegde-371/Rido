'use client'

import { useEffect, useState } from 'react'

interface DRMProtectionProps {
  children: React.ReactNode
  studentName: string
  studentEmail: string
}

export default function DRMProtection({ children, studentName, studentEmail }: DRMProtectionProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Prevent dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    // Prevent common inspect shortcuts and copy
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'P') ||
        (e.metaKey && e.key === 'c') ||
        (e.metaKey && e.key === 'p')
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('keydown', handleKeyDown)

    // Update time for watermark
    const interval = setInterval(() => {
      setTime(new Date().toLocaleString())
    }, 1000)
    setTime(new Date().toLocaleString())

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
    }
  }, [])

  // Create an array to map multiple watermarks diagonally across the screen
  const watermarks = Array.from({ length: 20 })

  return (
    <div className="relative w-full h-full select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Watermark Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden opacity-[0.03] mix-blend-difference flex flex-wrap justify-center items-center">
        {watermarks.map((_, i) => (
          <div 
            key={i} 
            className="text-2xl font-bold p-16 -rotate-45 whitespace-nowrap text-white"
          >
            {studentName} • {studentEmail} • {time}
          </div>
        ))}
      </div>
      
      {children}
    </div>
  )
}

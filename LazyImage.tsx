import React, { useState, useRef, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function LazyImage({ src, alt, className = '', fallback, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    setIsError(false)
  }

  const handleError = () => {
    setIsError(true)
    setIsLoaded(false)
  }

  const defaultFallback = (
    <div className={`flex items-center justify-center bg-muted ${className}`}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <ImageIcon className="w-8 h-8" />
        <span className="text-xs">Image not available</span>
      </div>
    </div>
  )

  if (isError) {
    return fallback || defaultFallback
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center bg-muted animate-pulse ${className}`}>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          {...props}
        />
      )}
    </div>
  )
}
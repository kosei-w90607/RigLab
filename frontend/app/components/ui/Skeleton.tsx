'use client'

import { type HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  }

  const defaultHeight = variant === 'text' ? '1em' : height
  const defaultWidth = variant === 'circular' ? height : width

  return (
    <div
      className={`
        bg-gray-200
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        width: defaultWidth,
        height: defaultHeight,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

export interface SkeletonTextProps {
  lines?: number
  lineHeight?: string | number
  gap?: string | number
  lastLineWidth?: string
}

export function SkeletonText({
  lines = 3,
  lineHeight = '1em',
  gap = '0.5rem',
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <div className="space-y-2" style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  )
}

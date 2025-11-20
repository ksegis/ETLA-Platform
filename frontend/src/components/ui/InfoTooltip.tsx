import React from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  content: string | React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  maxWidth?: number
  interactive?: boolean
  className?: string
}

export function InfoTooltip({ 
  content, 
  placement = 'top',
  maxWidth = 300,
  interactive = false,
  className = ''
}: InfoTooltipProps) {
  return (
    <Tippy
      content={content}
      placement={placement}
      theme="light"
      maxWidth={maxWidth}
      interactive={interactive}
      arrow={true}
    >
      <HelpCircle 
        className={`w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help inline-block ml-1 transition-colors ${className}`}
        aria-label="Help information"
      />
    </Tippy>
  )
}

export default InfoTooltip

import type { FC, ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  dockedBottom?: boolean
  animateRise?: boolean
  screenBg?: string
}

/**
 * Tactile slate phone bezel frame inspired by Wika's live device storytelling.
 * Supports `dockedBottom` for Hero and Bottom CTA rising mockups.
 */
export const PhoneFrame: FC<PhoneFrameProps> = ({
  children,
  dockedBottom = false,
  animateRise = false,
  screenBg,
}) => {
  const chassisClasses = [
    'eco-phone-chassis',
    dockedBottom ? 'eco-phone-chassis--docked' : '',
    animateRise ? 'eco-slide-up-phone' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={chassisClasses}>
      <div
        className="eco-phone-screen"
        style={screenBg ? { backgroundColor: screenBg } : undefined}
      >
        <div className="eco-phone-notch" aria-hidden="true" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 14px 16px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

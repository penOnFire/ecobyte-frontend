import { ViewTransition, useEffect, useRef, type FC, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

interface RouteContentTransitionProps {
  children: ReactNode
}

export const RouteContentTransition: FC<RouteContentTransitionProps> = ({ children }) => {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const outerRef = useRef<HTMLDivElement>(null)
  const previousPathRef = useRef<string>(pathname)

  useEffect(() => {
    if (previousPathRef.current === pathname) return
    previousPathRef.current = pathname

    // Reset scroll on forward navigations; preserve browser scroll restoration on back/forward
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    const mainEl = outerRef.current?.closest('main') as HTMLElement | null
    const focusTarget = mainEl ?? outerRef.current
    if (focusTarget) {
      if (!focusTarget.hasAttribute('tabindex')) {
        focusTarget.setAttribute('tabindex', '-1')
      }
      focusTarget.focus({ preventScroll: true })
    }
  }, [pathname, navigationType])

  return (
    <div ref={outerRef} style={{ outline: 'none' }}>
      <ViewTransition
        key={pathname}
        enter="eco-route-enter"
        exit="eco-route-exit"
        default="none"
      >
        <div>{children}</div>
      </ViewTransition>
    </div>
  )
}

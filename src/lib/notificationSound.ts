export type NotificationSoundVariant = 'default' | 'warning' | 'expired'

const MUTE_STORAGE_KEY = 'ecobyte_notif_sound_muted'

let sharedAudioCtx: AudioContext | null = null
let pendingVariant: NotificationSoundVariant | null = null
let unlockInstalled = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctor()
  }
  return sharedAudioCtx
}

export function isNotificationSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setNotificationSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false')
  } catch {
    // Ignore storage errors
  }
}

function scheduleTones(
  ctx: AudioContext,
  tones: Array<{ freq: number; delay: number; duration: number; gain: number; type: OscillatorType }>
): void {
  const start = ctx.currentTime + 0.01
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = tone.type
    osc.frequency.setValueAtTime(tone.freq, start + tone.delay)

    amp.gain.setValueAtTime(0.0001, start + tone.delay)
    amp.gain.exponentialRampToValueAtTime(tone.gain, start + tone.delay + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + tone.delay + tone.duration)

    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(start + tone.delay)
    osc.stop(start + tone.delay + tone.duration + 0.02)
  }
}

const SOUND_PATTERNS: Record<
  NotificationSoundVariant,
  Array<{ freq: number; delay: number; duration: number; gain: number; type: OscillatorType }>
> = {
  default: [
    { freq: 1046.5, delay: 0, duration: 0.14, gain: 0.14, type: 'sine' },
    { freq: 1318.5, delay: 0.11, duration: 0.22, gain: 0.16, type: 'sine' },
  ],
  warning: [
    { freq: 784, delay: 0, duration: 0.12, gain: 0.16, type: 'triangle' },
    { freq: 987.77, delay: 0.12, duration: 0.12, gain: 0.18, type: 'triangle' },
    { freq: 1174.66, delay: 0.24, duration: 0.24, gain: 0.18, type: 'triangle' },
  ],
  expired: [
    { freq: 880, delay: 0, duration: 0.15, gain: 0.18, type: 'triangle' },
    { freq: 698.46, delay: 0.16, duration: 0.28, gain: 0.2, type: 'triangle' },
  ],
}

/** Installs a one-time gesture listener to unlock Web Audio autoplay restrictions cleanly. */
export function installAudioUnlockListener(): void {
  if (typeof window === 'undefined' || unlockInstalled) return
  unlockInstalled = true

  const unlock = () => {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          if (pendingVariant && !isNotificationSoundMuted()) {
            const queued = pendingVariant
            pendingVariant = null
            scheduleTones(ctx, SOUND_PATTERNS[queued])
          }
        })
        .catch(() => {
          // Ignore resume errors
        })
    } else if (pendingVariant && !isNotificationSoundMuted()) {
      const queued = pendingVariant
      pendingVariant = null
      scheduleTones(ctx, SOUND_PATTERNS[queued])
    }
  }

  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock, { passive: true })
}

/** Plays a short synthesized chime for EcoByte notifications when unmuted. */
export function playNotificationSound(
  variant: NotificationSoundVariant = 'default'
): void {
  if (isNotificationSoundMuted()) return
  installAudioUnlockListener()

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    pendingVariant = variant
    ctx
      .resume()
      .then(() => {
        if (pendingVariant === variant && !isNotificationSoundMuted()) {
          pendingVariant = null
          scheduleTones(ctx, SOUND_PATTERNS[variant])
        }
      })
      .catch(() => {
        // Deferred until next user gesture via installAudioUnlockListener
      })
    return
  }

  try {
    scheduleTones(ctx, SOUND_PATTERNS[variant])
  } catch {
    // Ignore Web Audio errors on restricted devices
  }
}

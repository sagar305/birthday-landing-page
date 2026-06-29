import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useConfig } from './hooks/useConfig'
import FloatingBackground from './components/FloatingBackground'
import Loader from './components/Loader'
import LockScreen from './components/LockScreen'
import HeartGate from './components/HeartGate'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Reasons from './components/Reasons'
import Message from './components/Message'
import Wishes from './components/Wishes'
import Surprise from './components/Surprise'
import Timeline from './components/Timeline'
import Puzzle from './components/Puzzle'
import VoiceNote from './components/VoiceNote'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import ChatbotWidget from './components/ChatbotWidget'

const SECTION_COMPONENTS = {
  gallery: Gallery,
  reasons: Reasons,
  message: Message,
  wishes: Wishes,
  surprise: Surprise,
  timeline: Timeline,
  puzzle: Puzzle,
  voicenote: VoiceNote,
}

export default function App() {
  const { config, error } = useConfig()
  const [unlocked, setUnlocked] = useState(false)
  const [heartUnlocked, setHeartUnlocked] = useState(false)
  const [scrollUnlocked, setScrollUnlocked] = useState(false)
  const [scrollGateTriggered, setScrollGateTriggered] = useState(false)

  useEffect(() => {
    if (config?.siteTitle) {
      document.title = config.siteTitle
    }
  }, [config])

  const locked = config?.lock?.enabled && !unlocked
  const heartGated = config?.heartGate?.enabled && !heartUnlocked

  const scrollLockConfig = config?.scrollLock
  const scrollGated =
    scrollLockConfig?.enabled && scrollGateTriggered && !scrollUnlocked

  const scrollLocked = locked || heartGated || scrollGated

  useEffect(() => {
    const value = scrollLocked ? 'hidden' : ''
    document.documentElement.style.overflow = value
    document.body.style.overflow = value
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [scrollLocked])

  useEffect(() => {
    if (locked || heartGated) return
    if (!scrollLockConfig?.enabled || scrollUnlocked || scrollGateTriggered) return

    const threshold = scrollLockConfig.triggerPercent ?? 0.5

    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollableHeight <= 0) return
      const progress = window.scrollY / scrollableHeight
      if (progress >= threshold) {
        setScrollGateTriggered(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [locked, heartGated, scrollLockConfig, scrollUnlocked, scrollGateTriggered])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-slate-500">
        Failed to load page configuration. Please check{' '}
        <code className="mx-1 rounded bg-slate-100 px-2 py-1">/config.json</code>.
      </div>
    )
  }

  if (!config) return <Loader />

  const handleUnlock = () => setUnlocked(true)
  const handleHeartUnlock = () => setHeartUnlocked(true)
  const handleScrollUnlock = () => setScrollUnlocked(true)

  return (
    <div
      className="min-h-screen w-full cursor-none-fine"
      style={{ background: config.theme?.background || '#fff' }}
    >
      <CustomCursor emoji={heartUnlocked ? config.heartGate?.cursorEmoji : null} />

      <AnimatePresence>
        {locked && <LockScreen lock={config.lock} onUnlock={handleUnlock} />}
        {!locked && heartGated && (
          <HeartGate heartGate={config.heartGate} onUnlock={handleHeartUnlock} />
        )}
        {!locked && !heartGated && scrollGated && (
          <LockScreen lock={scrollLockConfig} onUnlock={handleScrollUnlock} />
        )}
      </AnimatePresence>

      {!locked && (
        <>
          <FloatingBackground />
          <Hero hero={config.hero} />

          {config.sections?.map((section) => {
            const Component = SECTION_COMPONENTS[section.type]
            if (!Component) return null
            return <Component key={section.id} section={section} />
          })}

          <Footer footer={config.footer} />
        </>
      )}

      {!locked && !heartGated && !scrollGated && <ChatbotWidget chatbot={config.chatbot} />}
    </div>
  )
}

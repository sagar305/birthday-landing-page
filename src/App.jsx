import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useConfig } from './hooks/useConfig'
import FloatingBackground from './components/FloatingBackground'
import Loader from './components/Loader'
import LockScreen from './components/LockScreen'
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

const LOCK_SESSION_KEY = 'birthday-unlocked'

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
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(LOCK_SESSION_KEY) === 'true'
  )

  useEffect(() => {
    if (config?.siteTitle) {
      document.title = config.siteTitle
    }
  }, [config])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-slate-500">
        Failed to load page configuration. Please check{' '}
        <code className="mx-1 rounded bg-slate-100 px-2 py-1">/config.json</code>.
      </div>
    )
  }

  if (!config) return <Loader />

  const handleUnlock = () => {
    sessionStorage.setItem(LOCK_SESSION_KEY, 'true')
    setUnlocked(true)
  }

  const locked = config.lock?.enabled && !unlocked

  return (
    <div
      className="min-h-screen w-full cursor-none-fine"
      style={{ background: config.theme?.background || '#fff' }}
    >
      <CustomCursor />

      <AnimatePresence>
        {locked && <LockScreen lock={config.lock} onUnlock={handleUnlock} />}
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
    </div>
  )
}

import { useEffect } from 'react'
import { useConfig } from './hooks/useConfig'
import FloatingBackground from './components/FloatingBackground'
import Loader from './components/Loader'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Reasons from './components/Reasons'
import Message from './components/Message'
import Wishes from './components/Wishes'
import Surprise from './components/Surprise'
import Footer from './components/Footer'

const SECTION_COMPONENTS = {
  gallery: Gallery,
  reasons: Reasons,
  message: Message,
  wishes: Wishes,
  surprise: Surprise,
}

export default function App() {
  const { config, error } = useConfig()

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

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: config.theme?.background || '#fff' }}
    >
      <FloatingBackground />
      <Hero hero={config.hero} />

      {config.sections?.map((section) => {
        const Component = SECTION_COMPONENTS[section.type]
        if (!Component) return null
        return <Component key={section.id} section={section} />
      })}

      <Footer footer={config.footer} />
    </div>
  )
}

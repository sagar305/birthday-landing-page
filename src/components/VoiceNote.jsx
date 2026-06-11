import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

const BAR_COUNT = 24

function Waveform({ playing }) {
  return (
    <div className="flex h-10 items-center justify-center gap-1">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-rose-400 to-indigo-400"
          animate={
            playing
              ? { height: ['30%', '100%', '45%', '80%', '30%'] }
              : { height: '20%' }
          }
          transition={
            playing
              ? {
                  duration: 0.9 + (i % 5) * 0.12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.03,
                }
              : { duration: 0.3 }
          }
          style={{ height: '20%' }}
        />
      ))}
    </div>
  )
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function AudioPlayer({ audio }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setProgress(el.currentTime)
    const onLoaded = () => setDuration(el.duration)
    const onEnd = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play().catch(() => setPlaying(false))
    }
    setPlaying(!playing)
  }

  const percent = duration ? (progress / duration) * 100 : 0

  return (
    <motion.div
      className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-xl backdrop-blur"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <audio ref={audioRef} src={audio.url} preload="metadata" />

      <div className="flex w-full items-center gap-4">
        <motion.button
          type="button"
          onClick={toggle}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-indigo-500 text-2xl text-white shadow-lg"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={playing ? { boxShadow: ['0 0 0 0 rgba(244,63,94,0.4)', '0 0 0 14px rgba(244,63,94,0)'] } : {}}
          transition={playing ? { duration: 1.4, repeat: Infinity } : {}}
          aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        >
          {playing ? '❚❚' : '▶'}
        </motion.button>

        <div className="flex-1 text-left">
          {audio.label && <p className="text-sm font-semibold text-slate-700">{audio.label}</p>}
          <Waveform playing={playing} />
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        <span className="w-10 text-xs text-slate-400">{formatTime(progress)}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-rose-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-indigo-400"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="w-10 text-right text-xs text-slate-400">{formatTime(duration)}</span>
      </div>
    </motion.div>
  )
}

function VideoPlayer({ video }) {
  return (
    <motion.div
      className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white/90 shadow-xl backdrop-blur"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
    >
      {video.label && (
        <p className="px-5 pt-4 text-left text-sm font-semibold text-slate-700">{video.label}</p>
      )}
      <video
        src={video.url}
        controls
        playsInline
        className="mt-3 aspect-video w-full bg-black"
      />
    </motion.div>
  )
}

export default function VoiceNote({ section }) {
  const { title, subtitle, audio, video } = section

  return (
    <Section id={section.id}>
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center gap-8">
        {audio?.url && <AudioPlayer audio={audio} />}
        {video?.url && <VideoPlayer video={video} />}
      </div>
    </Section>
  )
}

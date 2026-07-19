import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import Section, { SectionHeading } from './Section'

function TimelineItem({ item, isLeft }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.35'],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const x = useTransform(scrollYProgress, [0, 1], [isLeft ? -80 : 80, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const dotScale = useTransform(scrollYProgress, [0.4, 1], [0, 1])
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-start gap-4 pl-16 sm:pl-0 sm:items-center ${
        isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
    >
      <motion.div
        className="absolute top-6 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-rose-400 shadow sm:left-1/2 sm:-translate-x-1/2"
        style={{ scale: dotScale }}
      />

      <motion.div className="w-full sm:w-1/2" style={{ opacity, x, scale }}>
        <div
          className={`overflow-hidden rounded-2xl bg-white shadow-lg sm:max-w-sm ${
            isLeft ? 'sm:mr-10 sm:ml-auto' : 'sm:ml-10'
          }`}
        >
          {item.image && (
            <div className="h-56 w-full overflow-hidden">
              <motion.img
                src={item.image}
                alt={item.caption}
                className="h-[140%] w-full object-cover"
                style={{ y: imageY, objectPosition: `50% ${item.skipPercent ?? 0}%` }}
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4 text-left">
            {item.date && (
              <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-500 uppercase">
                {item.date}
              </span>
            )}
            {item.caption && (
              <p className="mt-2 text-sm text-slate-600 sm:text-base">{item.caption}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="hidden w-1/2 sm:block" />
    </div>
  )
}

export default function Timeline({ section }) {
  const { title, subtitle, items = [] } = section
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.7', 'end 0.5'],
  })
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  })

  return (
    <Section id={section.id}>
      <SectionHeading title={title} subtitle={subtitle} />
      <div ref={containerRef} className="relative">
        <div className="absolute top-0 left-1/2 hidden h-full w-1 -translate-x-1/2 rounded-full bg-rose-100 sm:block" />
        <div className="absolute top-0 left-6 h-full w-1 rounded-full bg-rose-100 sm:hidden" />

        <motion.div
          className="absolute top-0 left-1/2 hidden h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-rose-400 via-fuchsia-400 to-indigo-400 sm:block"
          style={{ scaleY: lineProgress, transformOrigin: 'top' }}
        />
        <motion.div
          className="absolute top-0 left-6 h-full w-1 rounded-full bg-gradient-to-b from-rose-400 via-fuchsia-400 to-indigo-400 sm:hidden"
          style={{ scaleY: lineProgress, transformOrigin: 'top' }}
        />

        <div className="flex flex-col gap-16 sm:gap-24">
          {items.map((item, i) => (
            <TimelineItem key={i} item={item} index={i} isLeft={i % 2 === 0} />
          ))}
        </div>
      </div>
    </Section>
  )
}

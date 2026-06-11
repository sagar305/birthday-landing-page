import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

export default function Timeline({ section }) {
  const { title, subtitle, items = [] } = section

  return (
    <Section id={section.id}>
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="relative">
        <motion.div
          className="absolute top-0 left-1/2 hidden h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-rose-300 via-fuchsia-300 to-indigo-300 sm:block"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
        <div className="absolute top-0 left-6 h-full w-1 rounded-full bg-gradient-to-b from-rose-300 via-fuchsia-300 to-indigo-300 sm:hidden" />

        <div className="flex flex-col gap-12">
          {items.map((item, i) => {
            const isLeft = i % 2 === 0
            return (
              <div
                key={i}
                className={`relative flex flex-col items-start gap-4 pl-16 sm:pl-0 sm:items-center ${
                  isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                <motion.div
                  className="absolute top-6 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-rose-400 shadow sm:left-1/2 sm:-translate-x-1/2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                />

                <motion.div
                  className="w-full sm:w-1/2"
                  initial={{ opacity: 0, x: isLeft ? -60 : 60, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <div
                    className={`overflow-hidden rounded-2xl bg-white shadow-lg sm:max-w-sm ${
                      isLeft ? 'sm:mr-10 sm:ml-auto' : 'sm:ml-10'
                    }`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.caption}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
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
          })}
        </div>
      </div>
    </Section>
  )
}

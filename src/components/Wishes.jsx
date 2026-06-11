import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

export default function Wishes({ section }) {
  const { title, subtitle, items = [] } = section

  return (
    <Section id={section.id} className="bg-white/40">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="flex gap-4 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-rose-50"
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.02 }}
          >
            {item.avatar && (
              <img
                src={item.avatar}
                alt={item.name}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-rose-200"
              />
            )}
            <div>
              <p className="font-semibold text-slate-800">{item.name}</p>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">{item.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

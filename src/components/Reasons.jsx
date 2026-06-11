import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

export default function Reasons({ section }) {
  const { title, subtitle, items = [] } = section

  return (
    <Section id={section.id} className="bg-white/40">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 150 }}
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(244,63,94,0.2)' }}
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: i * 0.3, ease: 'easeInOut' }}
            >
              {item.icon}
            </motion.span>
            <p className="text-sm text-slate-600 sm:text-base">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

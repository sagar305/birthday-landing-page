import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

export default function Gallery({ section }) {
  const { title, subtitle, items = [] } = section

  return (
    <Section id={section.id}>
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.figure
            key={i}
            className="group relative overflow-hidden rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -3 : 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
            whileTap={{ scale: 0.97, rotate: 0, zIndex: 10 }}
          >
            <img
              src={item.image}
              alt={item.caption}
              className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ objectPosition: `50% ${item.skipPercent ?? 0}%` }}
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm font-medium text-white opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
              {item.caption}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  )
}

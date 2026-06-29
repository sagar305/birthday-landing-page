import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const DEFAULT_LOADING_MESSAGES = [
  'Digging through his heart...',
  'Searching for the right feelings...',
  'Decoding the love algorithm...',
]

function ThinkingBubble({ messages }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 900)
    return () => clearInterval(interval)
  }, [messages])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-sm bg-rose-50 px-4 py-2.5 text-sm text-rose-500"
    >
      <motion.span
        className="relative inline-block text-lg"
        animate={{ rotate: [0, -12, 12, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        💗
        <motion.span
          className="absolute -top-2 -right-3 text-xs"
          animate={{ x: [0, 4, -2, 0], y: [0, -3, 2, 0], rotate: [0, 15, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔍
        </motion.span>
      </motion.span>
      <span>{messages[index]}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-rose-400"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </span>
    </motion.div>
  )
}

export default function ChatbotWidget({ chatbot }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [askedIndexes, setAskedIndexes] = useState(() => new Set())
  const scrollRef = useRef(null)
  const idRef = useRef(0)

  const allQuestions = chatbot?.questions || []
  const remainingQuestions = allQuestions
    .map((q, i) => ({ ...q, index: i }))
    .filter((q) => !askedIndexes.has(q.index))
  const loadingMessages = chatbot?.loadingMessages?.length
    ? chatbot.loadingMessages
    : DEFAULT_LOADING_MESSAGES
  const loadingDuration = chatbot?.loadingDuration ?? 1800

  useEffect(() => {
    if (open && messages.length === 0 && chatbot?.greeting) {
      setMessages([{ id: idRef.current++, role: 'bot', text: chatbot.greeting }])
    }
  }, [open, messages.length, chatbot?.greeting])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  if (!chatbot?.enabled) return null

  const askQuestion = (item) => {
    if (busy) return
    setMessages((prev) => [...prev, { id: idRef.current++, role: 'user', text: item.question }])
    setAskedIndexes((prev) => new Set(prev).add(item.index))
    setBusy(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: idRef.current++, role: 'bot', text: item.answer }])
      setBusy(false)
    }, loadingDuration)
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="cursor-hover fixed right-5 bottom-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-fuchsia-500 to-indigo-500 text-3xl shadow-xl sm:right-6 sm:bottom-6"
        animate={{ scale: open ? 1 : [1, 1.08, 1] }}
        transition={open ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {open ? '✕' : chatbot.buttonEmoji || '🤖'}
          </motion.span>
        </AnimatePresence>

        {!open && (
          <motion.span
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 ring-2 ring-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed right-4 bottom-24 z-40 flex max-h-[70vh] w-[90vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white/95 shadow-2xl backdrop-blur sm:right-6"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-5 py-4 text-white">
              <span className="text-2xl">{chatbot.buttonEmoji || '🤖'}</span>
              <div>
                <p className="font-display font-semibold">{chatbot.title || 'Ask My Heart'}</p>
                {chatbot.subtitle && <p className="text-xs text-white/80">{chatbot.subtitle}</p>}
              </div>
            </div>

            <div ref={scrollRef} className="flex flex-col gap-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto rounded-br-sm bg-gradient-to-r from-rose-500 to-indigo-500 text-white'
                      : 'rounded-bl-sm bg-rose-50 text-slate-700'
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              {busy && <ThinkingBubble messages={loadingMessages} />}
            </div>

            {remainingQuestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-rose-100 px-4 py-3">
                <AnimatePresence>
                  {remainingQuestions.map((q) => (
                    <motion.button
                      key={q.index}
                      type="button"
                      disabled={busy}
                      onClick={() => askQuestion(q)}
                      initial={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: busy ? 1 : 1.05 }}
                      whileTap={{ scale: busy ? 1 : 0.95 }}
                      className="cursor-hover rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-500 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {q.question}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              allQuestions.length > 0 && (
                <p className="border-t border-rose-100 px-4 py-3 text-center text-xs text-rose-400">
                  That's everything my heart knows... for now 💕
                </p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

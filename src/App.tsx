import { useEffect, useMemo, useRef, useState } from 'react'
import { config, type Mode } from './config'
import { prompts } from './prompts'
import { Tutor, type Line, type Status } from './live/tutor'

// Throwaway phase 0 UI: pick a mode, talk, read the raw transcript, check latency.

export function App() {
  const [mode, setMode] = useState<Mode>('topic')
  const [model, setModel] = useState(config.model)
  const [voice, setVoice] = useState(config.defaultVoice.topic)
  const [status, setStatus] = useState<Status>('idle')
  const [detail, setDetail] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [latencies, setLatencies] = useState<number[]>([])
  const [log, setLog] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const tutorRef = useRef<Tutor | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  if (!tutorRef.current) {
    tutorRef.current = new Tutor({
      status: (s, d) => {
        setStatus(s)
        setDetail(d ?? '')
      },
      transcript: setLines,
      latency: (ms) => setLatencies((prev) => [...prev, ms]),
      log: (m) => {
        const line = `${new Date().toLocaleTimeString()} ${m}`
        console.info('[luter]', m)
        setLog((prev) => [...prev.slice(-200), line])
      },
    })
  }

  useEffect(() => {
    return () => tutorRef.current?.stop()
  }, [])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const running = status === 'connecting' || status === 'live'
  const stats = useMemo(() => summarise(latencies), [latencies])

  function changeMode(m: Mode) {
    setMode(m)
    setVoice(config.defaultVoice[m])
  }

  function toggle() {
    if (running) {
      tutorRef.current?.stop()
    } else {
      setLatencies([])
      setLog([])
      void tutorRef.current?.start({ mode, model, voice })
    }
  }

  async function copyReport() {
    const text = [
      `Luter phase 0 session, ${new Date().toISOString()}`,
      `Mode: ${prompts[mode].label}`,
      `Model: ${model}`,
      `Voice: ${voice}`,
      `VAD silence: ${config.vadSilenceMs}ms`,
      `Latency: ${stats ? `${stats.count} turns, median ${stats.median}ms, best ${stats.min}ms, worst ${stats.max}ms, ${stats.underOneSecond}% under 1s` : 'none measured'}`,
      `All latencies: ${latencies.join(', ')}`,
      '',
      'Transcript:',
      ...lines.map((l) => `${l.who === 'you' ? 'You' : 'Tutor'}: ${l.text}`),
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main>
      <h1>
        <img src="/mascot.png" alt="" width={40} height={40} /> Luter
      </h1>

      <section className="controls">
        <label>
          Mode
          <select value={mode} disabled={running} onChange={(e) => changeMode(e.target.value as Mode)}>
            {(Object.keys(prompts) as Mode[]).map((m) => (
              <option key={m} value={m}>
                {prompts[m].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Model
          <select value={model} disabled={running} onChange={(e) => setModel(e.target.value)}>
            {config.models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Voice
          <select value={voice} disabled={running} onChange={(e) => setVoice(e.target.value)}>
            {config.voices.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className={running ? 'stop' : 'start'} onClick={toggle}>
          {running ? 'Stop' : 'Start'}
        </button>
      </section>

      <p className={`status ${status}`}>
        {status === 'idle' && 'Ready. Headphones recommended.'}
        {status === 'connecting' && 'Connecting…'}
        {status === 'live' && 'Live. Just talk.'}
        {status === 'error' && `Error: ${detail}`}
      </p>

      <section className="stats">
        {stats ? (
          <>
            <span>Last {latencies[latencies.length - 1]}ms</span>
            <span>Median {stats.median}ms</span>
            <span>Best {stats.min}ms</span>
            <span>Worst {stats.max}ms</span>
            <span>{stats.underOneSecond}% under 1s</span>
            <span>{stats.count} turns</span>
          </>
        ) : (
          <span>Latency appears after your first reply.</span>
        )}
        <button className="link" onClick={copyReport} disabled={lines.length === 0}>
          {copied ? 'Copied' : 'Copy report'}
        </button>
      </section>

      <section className="transcript">
        {lines.map((l) => (
          <p key={l.id} className={l.who}>
            <b>{l.who === 'you' ? 'You' : 'Tutor'}:</b> {l.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </section>

      <details>
        <summary>Debug log</summary>
        <pre>{log.join('\n')}</pre>
      </details>
    </main>
  )
}

function summarise(values: number[]) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  return {
    count: values.length,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    underOneSecond: Math.round((values.filter((v) => v < 1000).length / values.length) * 100),
  }
}

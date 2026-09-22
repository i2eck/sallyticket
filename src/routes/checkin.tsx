import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import jsQR from 'jsqr'
import { Camera, CheckCircle2, XCircle } from 'lucide-react'
import { EVENT } from '@/lib/fixtures'
import { ticketTypeFor, verifyTicket } from '@/lib/tickets'
import { extractTicketNumber } from '@/lib/ticket-codes'

export const Route = createFileRoute('/checkin')({
  component: CheckInPage,
})

type Result = {
  kind: 'valid' | 'used' | 'invalid' | 'error'
  title: string
  lines: string[]
}

const RESULT_STYLE: Record<Result['kind'], string> = {
  valid: 'bg-emerald-600',
  used: 'bg-amber-500',
  invalid: 'bg-red-600',
  error: 'bg-gray-700',
}

function CheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const busyRef = useRef(false)
  const lastScanRef = useRef({ text: '', at: 0 })
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [manual, setManual] = useState('')

  const check = useCallback(async (number: string) => {
    busyRef.current = true
    setResult(null)
    try {
      const r = await verifyTicket(number)
      const type = r.ticket ? (ticketTypeFor(r.ticket.type)?.name ?? 'Ticket') : ''
      if (r.status === 'valid' && r.ticket) {
        setResult({ kind: 'valid', title: 'VALID — LET IN', lines: [r.ticket.name, `${type} · ${number}`] })
      } else if (r.status === 'used' && r.ticket) {
        const when = r.ticket.checkedInAt ? r.ticket.checkedInAt.toLocaleString() : 'earlier'
        setResult({ kind: 'used', title: 'ALREADY USED', lines: [r.ticket.name, `Entered: ${when}`, number] })
      } else {
        setResult({ kind: 'invalid', title: 'INVALID TICKET', lines: [`No ticket found with number ${number}.`] })
      }
    } catch (error) {
      console.error('Verify failed', error)
      setResult({
        kind: 'error',
        title: 'COULD NOT VERIFY',
        lines: ['No connection or server error. Do not let them in yet. Try again.'],
      })
    }
  }, [])

  const onScan = useCallback(
    (text: string) => {
      const now = Date.now()
      const last = lastScanRef.current
      if (text === last.text && now - last.at < 3000) return
      lastScanRef.current = { text, at: now }
      const number = extractTicketNumber(text)
      if (!number) {
        busyRef.current = true
        setResult({ kind: 'invalid', title: 'NOT A TICKET', lines: ['This QR code is not a Sally Joy Camps ticket.'] })
        return
      }
      void check(number)
    },
    [check],
  )

  // Keep the latest handler in a ref so the camera loop is not restarted on every render.
  const onScanRef = useRef(onScan)
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    if (!cameraOn) return
    let cancelled = false
    let stream: MediaStream | null = null
    let raf = 0
    let lastTick = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    function tick(now: number) {
      raf = requestAnimationFrame(tick)
      const video = videoRef.current
      if (!video || !ctx || busyRef.current || video.readyState < 2 || now - lastTick < 120) return
      lastTick = now
      const scale = Math.min(1, 640 / video.videoWidth)
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' })
      if (code?.data) onScanRef.current(code.data)
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        raf = requestAnimationFrame(tick)
      } catch {
        setCameraError('Camera unavailable. Allow camera access in your browser, or type the ticket number below.')
        setCameraOn(false)
      }
    }
    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [cameraOn])

  function scanNext() {
    setResult(null)
    busyRef.current = false
    lastScanRef.current = { text: '', at: 0 }
  }

  function submitManual(e: FormEvent) {
    e.preventDefault()
    const number = extractTicketNumber(manual)
    setManual('')
    if (!number) {
      busyRef.current = true
      setResult({ kind: 'invalid', title: 'INVALID TICKET', lines: ['Type the 10-character ticket number.'] })
      return
    }
    void check(number)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gate Check-in</h1>
        <p className="text-sm text-gray-500 mb-6">
          {EVENT.name} — scan each ticket&apos;s QR code before letting guests in.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`}
            />
            {!cameraOn && (
              <button
                onClick={() => {
                  setCameraError('')
                  setCameraOn(true)
                }}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" /> Start camera
              </button>
            )}
          </div>
          {cameraOn && (
            <button
              onClick={() => setCameraOn(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Stop camera
            </button>
          )}
          {cameraError && <p className="mt-3 text-sm text-amber-700">{cameraError}</p>}
        </div>

        {result && (
          <div
            role="status"
            className={`${RESULT_STYLE[result.kind]} text-white rounded-2xl p-6 text-center mb-4`}
          >
            <div className="flex justify-center mb-2">
              {result.kind === 'valid' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <p className="text-2xl font-extrabold">{result.title}</p>
            {result.lines.map((line) => (
              <p key={line} className="mt-1">
                {line}
              </p>
            ))}
            <button
              onClick={scanNext}
              className="mt-5 bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-lg"
            >
              Scan next ticket
            </button>
          </div>
        )}

        <form onSubmit={submitManual} className="bg-white rounded-2xl shadow-sm p-4 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="Or type the ticket number"
            maxLength={16}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 rounded-lg transition-colors"
          >
            Check
          </button>
        </form>
      </div>
    </div>
  )
}

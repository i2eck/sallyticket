import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect } from "react";
import jsQR from "jsqr";
import { Camera, CheckCircle2, XCircle } from "lucide-react";
import { E as EVENT } from "./router-CtCIkKPA.js";
import { v as verifyTicket, t as ticketTypeFor } from "./tickets-B2FiYyRM.js";
import { e as extractTicketNumber } from "./ticket-codes-DETT-_yM.js";
import "@tanstack/react-router";
import "chart.js";
import "firebase/firestore";
import "firebase/app";
const RESULT_STYLE = {
  valid: "bg-emerald-600",
  used: "bg-amber-500",
  invalid: "bg-red-600",
  error: "bg-gray-700"
};
function CheckInPage() {
  const videoRef = useRef(null);
  const busyRef = useRef(false);
  const lastScanRef = useRef({
    text: "",
    at: 0
  });
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState("");
  const check = useCallback(async (number) => {
    busyRef.current = true;
    setResult(null);
    try {
      const r = await verifyTicket(number);
      const type = r.ticket ? ticketTypeFor(r.ticket.type)?.name ?? "Ticket" : "";
      if (r.status === "valid" && r.ticket) {
        setResult({
          kind: "valid",
          title: "VALID — LET IN",
          lines: [r.ticket.name, `${type} · ${number}`]
        });
      } else if (r.status === "used" && r.ticket) {
        const when = r.ticket.checkedInAt ? r.ticket.checkedInAt.toLocaleString() : "earlier";
        setResult({
          kind: "used",
          title: "ALREADY USED",
          lines: [r.ticket.name, `Entered: ${when}`, number]
        });
      } else {
        setResult({
          kind: "invalid",
          title: "INVALID TICKET",
          lines: [`No ticket found with number ${number}.`]
        });
      }
    } catch (error) {
      console.error("Verify failed", error);
      setResult({
        kind: "error",
        title: "COULD NOT VERIFY",
        lines: ["No connection or server error. Do not let them in yet. Try again."]
      });
    }
  }, []);
  const onScan = useCallback((text) => {
    const now = Date.now();
    const last = lastScanRef.current;
    if (text === last.text && now - last.at < 3e3) return;
    lastScanRef.current = {
      text,
      at: now
    };
    const number = extractTicketNumber(text);
    if (!number) {
      busyRef.current = true;
      setResult({
        kind: "invalid",
        title: "NOT A TICKET",
        lines: ["This QR code is not a Sally Joy Camps ticket."]
      });
      return;
    }
    void check(number);
  }, [check]);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);
  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    let stream = null;
    let raf = 0;
    let lastTick = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (!video || !ctx || busyRef.current || video.readyState < 2 || now - lastTick < 120) return;
      lastTick = now;
      const scale = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert"
      });
      if (code?.data) onScanRef.current(code.data);
    }
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"
          },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        raf = requestAnimationFrame(tick);
      } catch {
        setCameraError("Camera unavailable. Allow camera access in your browser, or type the ticket number below.");
        setCameraOn(false);
      }
    }
    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraOn]);
  function scanNext() {
    setResult(null);
    busyRef.current = false;
    lastScanRef.current = {
      text: "",
      at: 0
    };
  }
  function submitManual(e) {
    e.preventDefault();
    const number = extractTicketNumber(manual);
    setManual("");
    if (!number) {
      busyRef.current = true;
      setResult({
        kind: "invalid",
        title: "INVALID TICKET",
        lines: ["Type the 10-character ticket number."]
      });
      return;
    }
    void check(number);
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Gate Check-in" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-6", children: [
      EVENT.name,
      " — scan each ticket's QR code before letting guests in."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative aspect-square w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center", children: [
        /* @__PURE__ */ jsx("video", { ref: videoRef, playsInline: true, muted: true, className: `absolute inset-0 w-full h-full object-cover ${cameraOn ? "" : "hidden"}` }),
        !cameraOn && /* @__PURE__ */ jsxs("button", { onClick: () => {
          setCameraError("");
          setCameraOn(true);
        }, className: "inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-5 py-3 rounded-lg transition-colors", children: [
          /* @__PURE__ */ jsx(Camera, { className: "w-5 h-5" }),
          " Start camera"
        ] })
      ] }),
      cameraOn && /* @__PURE__ */ jsx("button", { onClick: () => setCameraOn(false), className: "mt-3 text-sm text-gray-500 hover:text-gray-800 underline", children: "Stop camera" }),
      cameraError && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-amber-700", children: cameraError })
    ] }),
    result && /* @__PURE__ */ jsxs("div", { role: "status", className: `${RESULT_STYLE[result.kind]} text-white rounded-2xl p-6 text-center mb-4`, children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: result.kind === "valid" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-10 h-10" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-10 h-10" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold", children: result.title }),
      result.lines.map((line) => /* @__PURE__ */ jsx("p", { className: "mt-1", children: line }, line)),
      /* @__PURE__ */ jsx("button", { onClick: scanNext, className: "mt-5 bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-lg", children: "Scan next ticket" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submitManual, className: "bg-white rounded-2xl shadow-sm p-4 flex gap-2", children: [
      /* @__PURE__ */ jsx("input", { value: manual, onChange: (e) => setManual(e.target.value.toUpperCase()), placeholder: "Or type the ticket number", maxLength: 16, className: "flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 rounded-lg transition-colors", children: "Check" })
    ] })
  ] }) });
}
export {
  CheckInPage as component
};

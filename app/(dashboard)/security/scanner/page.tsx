"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import {
  loadGates,
  loadSecurityEvents,
  processSecurityScan,
  saveGatePreset,
  saveSecurityEvents,
  type SecurityEventRecord,
  type SecurityGate,
  type SecurityGateId,
} from "@/components/dashboard/securityStore";
import {
  fetchSecurityEvents,
  fetchSecurityGates,
  securityManualDenialRequest,
  securityScanRequest,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

type QrBarcode = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect(input: ImageBitmapSource): Promise<QrBarcode[]>;
};
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorInstance;

function extractCode(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const fromParam = url.searchParams.get("code");
    if (fromParam) return fromParam.trim();
  } catch {
    // not a full URL, continue
  }
  const match = trimmed.match(/[?&]code=([^&]+)/i);
  if (match?.[1]) return decodeURIComponent(match[1]).trim();
  return trimmed;
}

export default function SecurityScannerPage() {
  const [gateId, setGateId] = useState<SecurityGateId>("north");
  const [recentGateFilter, setRecentGateFilter] = useState<"all" | SecurityGateId>("all");
  const [gates, setGates] = useState<SecurityGate[]>([]);
  const [scanCode, setScanCode] = useState("");
  const [events, setEvents] = useState<SecurityEventRecord[]>([]);
  const [lastScan, setLastScan] = useState<{ ok: boolean; event: SecurityEventRecord } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualReason, setManualReason] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualBusy, setManualBusy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const refresh = () => {
    if (isApiMode()) {
      void (async () => {
        try {
          const [gs, evs] = await Promise.all([fetchSecurityGates(), fetchSecurityEvents({ limit: 200 })]);
          setGates(gs.length ? gs : loadGates());
          const list = gs.length ? gs : loadGates();
          if (!list.some((g) => g.id === gateId)) setGateId((list[0]?.id as SecurityGateId) ?? "north");
          setEvents(evs);
        } catch {
          const gs = loadGates();
          setGates(gs);
          setEvents(loadSecurityEvents());
        }
      })();
      return;
    }
    const gs = loadGates();
    setGates(gs);
    if (!gs.some((g) => g.id === gateId)) setGateId(gs[0]?.id ?? "north");
    setEvents(loadSecurityEvents());
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_security_events_v1" || e.key === "estateos_security_gates_v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [gateId]);

  const stopCamera = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.srcObject = null;
    }
    setCameraReady(false);
    setIsDetecting(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      setCameraError("");
      return;
    }

    let cancelled = false;
    const run = async () => {
      const BarcodeDetectorImpl = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API not available in this browser.");
        return;
      }
      if (!BarcodeDetectorImpl) {
        setCameraError("Live QR detection is not supported in this browser. Use Chrome on mobile/desktop.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
        setCameraReady(true);
        const detector = new BarcodeDetectorImpl({ formats: ["qr_code"] });
        const loop = async () => {
          if (!cameraOpen || cancelled) return;
          if (v.readyState >= 2 && !isDetecting) {
            setIsDetecting(true);
            try {
              const found = await detector.detect(v);
              const raw = found.find((x) => x.rawValue)?.rawValue ?? "";
              const code = extractCode(raw);
              if (code) {
                if (isApiMode()) {
                  void (async () => {
                    try {
                      const result = await securityScanRequest({
                        rawQrPayload: code,
                        gateId,
                        action: "auto",
                      });
                      setLastScan(result);
                      setScanCode(code);
                      refresh();
                      setCameraOpen(false);
                    } catch {
                      /* ignore */
                    }
                  })();
                  return;
                }
                const result = processSecurityScan({ subjectCode: code, gateId, action: "auto" });
                setLastScan(result);
                setScanCode(code);
                refresh();
                setCameraOpen(false);
                return;
              }
            } catch {
              // ignore single-frame detection failures
            } finally {
              setIsDetecting(false);
            }
          }
          rafRef.current = window.requestAnimationFrame(loop);
        };
        rafRef.current = window.requestAnimationFrame(loop);
      } catch {
        setCameraError("Could not access camera. Check permissions and try again.");
      }
    };
    run();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOpen, gateId, isDetecting]);

  const recent = useMemo(
    () =>
      events
        .filter((e) => (recentGateFilter === "all" ? true : e.gateId === recentGateFilter))
        .slice(0, 30),
    [events, recentGateFilter],
  );

  const submit = (action: "auto" | "entry" | "exit") => {
    if (!scanCode.trim()) return;
    const raw = scanCode.trim();
    if (isApiMode()) {
      void (async () => {
        try {
          const result = await securityScanRequest({ rawQrPayload: raw, gateId, action });
          setLastScan(result);
          setScanCode("");
          refresh();
        } catch {
          /* ignore */
        }
      })();
      return;
    }
    const result = processSecurityScan({ subjectCode: raw, gateId, action });
    setLastScan(result);
    setScanCode("");
    refresh();
  };

  const submitManualDenial = () => {
    const reason = manualReason.trim();
    if (!reason) return;
    if (isApiMode()) {
      setManualBusy(true);
      void (async () => {
        try {
          const result = await securityManualDenialRequest({
            gateId,
            reason,
            subjectCode: manualCode.trim() || undefined,
          });
          setLastScan(result);
          setManualReason("");
          setManualCode("");
          refresh();
        } catch {
          /* ignore */
        } finally {
          setManualBusy(false);
        }
      })();
      return;
    }
    const ev: SecurityEventRecord = {
      id: `manual_${Date.now()}`,
      type: "access_denied",
      gateId,
      gateName: gates.find((g) => g.id === gateId)?.name ?? gateId,
      time: Date.now(),
      subjectType: "unknown",
      subjectCode: manualCode.trim() || "MANUAL",
      action: "entry",
      message: `Manual denial: ${reason}`,
    };
    setLastScan({ ok: false, event: ev });
    const list = loadSecurityEvents();
    saveSecurityEvents([ev, ...list].slice(0, 500));
    setManualReason("");
    setManualCode("");
    refresh();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-soft p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Scanner console</h2>
          <Select value={gateId} onChange={(e) => {
            const v = e.target.value as SecurityGateId;
            setGateId(v);
            saveGatePreset(v);
          }}>
            {gates.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
        </div>
        <Input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Visitor code or resident code" />
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => submit("auto")}>Auto</Button>
          <Button variant="outline" onClick={() => submit("entry")}>Entry</Button>
          <Button className="bg-destructive text-destructive-foreground" onClick={() => submit("exit")}>Exit</Button>
        </div>
        <Button variant="outline" onClick={() => setCameraOpen(true)}>
          <Camera className="h-4 w-4 mr-2" />
          Scan QR with camera
        </Button>
        {lastScan && (
          <div className={`rounded-lg border px-3 py-2 text-sm ${lastScan.ok ? "border-emerald-300 bg-emerald-50/40" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
            {lastScan.event.message}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Manual denial</h3>
        <p className="text-sm text-muted-foreground">
          Log a walk-in denial or override without scanning a QR (reason is recorded on the security event log).
        </p>
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Subject code (optional)"
          className="font-mono text-sm"
        />
        <textarea
          value={manualReason}
          onChange={(e) => setManualReason(e.target.value)}
          placeholder="Reason for denial"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="button"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          disabled={manualBusy || !manualReason.trim()}
          onClick={() => submitManualDenial()}
        >
          {manualBusy ? "Logging…" : "Log manual denial"}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent scans ({recent.length})</h3>
          <Select
            value={recentGateFilter}
            onChange={(e) => setRecentGateFilter(e.target.value as "all" | SecurityGateId)}
          >
            <option value="all">All gates</option>
            {gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Gate</th>
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((ev) => (
                <tr key={ev.id} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmt(ev.time)}</td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{ev.gateName}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">{ev.subjectCode}</td>
                  <td className="px-3 py-2 text-foreground">{ev.message}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No scans yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} title="Scan QR code">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Point your camera at the QR code. Once detected, it will auto-fill and process scan.
          </p>
          <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[300px] object-cover bg-black"
              playsInline
              muted
              autoPlay
            />
          </div>
          {!cameraReady && !cameraError && (
            <p className="text-xs text-muted-foreground">Starting camera...</p>
          )}
          {cameraError && (
            <p className="text-sm text-destructive">{cameraError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

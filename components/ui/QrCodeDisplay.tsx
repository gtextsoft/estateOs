"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCodeDisplay({
  value,
  size = 96,
  showDownload = false,
  downloadFilename = "qr-code.png",
}: {
  value: string;
  size?: number;
  showDownload?: boolean;
  downloadFilename?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    if (!value) {
      setDataUrl("");
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url: string) => {
        if (cancelled) return;
        setDataUrl(url);
      })
      .catch(() => {
        if (cancelled) return;
        setDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      <img
        src={dataUrl}
        width={size}
        height={size}
        alt="QR code"
        className="rounded-lg border border-border bg-background"
      />
      {showDownload && (
        <a
          href={dataUrl}
          download={downloadFilename}
          className="inline-flex h-9 px-3 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-sm font-medium text-foreground"
        >
          Download QR
        </a>
      )}
    </div>
  );
}


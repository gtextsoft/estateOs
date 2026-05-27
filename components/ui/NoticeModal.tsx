"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { MessageModalState } from "@/lib/use-message-modals";

export function NoticeModal({
  notice,
  onClose,
  confirmLabel = "Okay",
}: {
  notice: MessageModalState | null;
  onClose: () => void;
  confirmLabel?: string;
}) {
  return (
    <Modal isOpen={Boolean(notice)} onClose={onClose} title={notice?.title ?? "Notice"}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{notice?.message}</p>
        <div className="flex justify-end">
          <Button onClick={onClose}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

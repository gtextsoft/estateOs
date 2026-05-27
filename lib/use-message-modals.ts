"use client";

import { useCallback, useEffect, useState } from "react";

export type MessageModalState = {
  title: string;
  message: string;
};

export function useMessageModals() {
  const [noticeModal, setNoticeModal] = useState<MessageModalState | null>(null);
  const [noticeQueue, setNoticeQueue] = useState<MessageModalState[]>([]);

  const enqueueNotice = useCallback((title: string, message: string) => {
    setNoticeQueue((prev) => [...prev, { title, message }]);
  }, []);

  const dismissNotice = useCallback(() => {
    setNoticeModal(null);
  }, []);

  useEffect(() => {
    if (noticeModal || noticeQueue.length === 0) return;
    setNoticeModal(noticeQueue[0]);
    setNoticeQueue((prev) => prev.slice(1));
  }, [noticeModal, noticeQueue]);

  return {
    noticeModal,
    enqueueNotice,
    dismissNotice,
  };
}

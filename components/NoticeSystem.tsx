"use client";

import { useCallback, useEffect, useState } from "react";
import { NoticeBanner } from "./NoticeBanner";
import { NoticeModal } from "./NoticeModal";

const STORAGE_KEY = "deb-notice-seen";

export function NoticeSystem() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.sessionStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // sessionStorage may be blocked (private mode, embedded contexts).
      // In that case fall back to showing the modal every visit — the
      // operational info is important enough to err on this side.
      setOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const reopen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <NoticeBanner onClick={reopen} />
      <NoticeModal open={open} onClose={close} />
    </>
  );
}

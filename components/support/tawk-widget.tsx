'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void
      showWidget?: () => void
      maximize?: () => void
      minimize?: () => void
      isChatMaximized?: () => boolean
      onLoad?: () => void
      onChatMinimized?: () => void
    }
    Tawk_LoadStart?: Date
    __tawkPendingIntent?: 'open' | 'close' | null
  }
}

const TAWK_EMBED_SRC =
  'https://embed.tawk.to/6aa36f20279bff344394a77a/1k276k64h'

let readyTimer: number | null = null

function isTawkReady() {
  return typeof window.Tawk_API?.maximize === 'function'
}

function isChatOpen() {
  return window.Tawk_API?.isChatMaximized?.() === true
}

function openChat() {
  window.Tawk_API?.showWidget?.()
  window.Tawk_API?.maximize?.()
}

function closeChat() {
  window.Tawk_API?.minimize?.()
  window.Tawk_API?.hideWidget?.()
}

function applyPendingIntent() {
  const intent = window.__tawkPendingIntent
  window.__tawkPendingIntent = null
  if (intent === 'open') {
    openChat()
    return
  }
  if (intent === 'close' || !isChatOpen()) {
    closeChat()
  }
}

function startReadyPoll() {
  if (readyTimer != null) return

  const startedAt = Date.now()
  readyTimer = window.setInterval(() => {
    if (isTawkReady()) {
      applyPendingIntent()
      window.clearInterval(readyTimer!)
      readyTimer = null
    } else if (Date.now() - startedAt > 10_000) {
      window.clearInterval(readyTimer!)
      readyTimer = null
    }
  }, 250)
}

export function openTawkChat() {
  if (typeof window === 'undefined') return

  if (isTawkReady()) {
    if (!isChatOpen()) openChat()
    window.__tawkPendingIntent = null
    return
  }

  window.__tawkPendingIntent = 'open'
  startReadyPoll()
}

export function toggleTawkChat() {
  if (typeof window === 'undefined') return

  if (isTawkReady()) {
    if (isChatOpen()) closeChat()
    else openChat()
    window.__tawkPendingIntent = null
    return
  }

  window.__tawkPendingIntent =
    window.__tawkPendingIntent === 'open' ? 'close' : 'open'
  startReadyPoll()
}

export function TawkWidget() {
  useEffect(() => {
    return () => {
      window.Tawk_API?.hideWidget?.()
    }
  }, [])

  return (
    <>
      <style>{`
        .tawk-min-container,
        .tawk-flex-min {
          display: none !important;
        }
      `}</style>
      <Script id='tawk-to-widget' strategy='afterInteractive'>
        {`
          var Tawk_API = Tawk_API || {};
          var Tawk_LoadStart = new Date();
          Tawk_API.onLoad = function () {
            Tawk_API.onChatMinimized = function () {
              if (Tawk_API.hideWidget) Tawk_API.hideWidget();
            };
            if (window.__tawkPendingIntent === 'open') {
              if (Tawk_API.showWidget) Tawk_API.showWidget();
              if (Tawk_API.maximize) Tawk_API.maximize();
              window.__tawkPendingIntent = null;
            } else if (Tawk_API.hideWidget) {
              Tawk_API.hideWidget();
              window.__tawkPendingIntent = null;
            }
          };
          (function () {
            var s1 = document.createElement('script');
            var s0 = document.getElementsByTagName('script')[0];
            s1.async = true;
            s1.src = '${TAWK_EMBED_SRC}';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
          })();
        `}
      </Script>
    </>
  )
}

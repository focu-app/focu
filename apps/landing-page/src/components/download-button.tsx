'use client'

import { useState, useEffect } from 'react'
import { WarningDialog } from './warning-dialog'

export function DownloadButton() {
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [isMacSilicon, setIsMacSilicon] = useState(true)
  const [version, setVersion] = useState('')
  const [downloadLink, setDownloadLink] = useState('')

  useEffect(() => {
    const fetchVersion = async () => {
      const result = await fetch("https://focu.app/api/latest-release");
      const { version } = await result.json();
      setVersion(version);
      setDownloadLink(`https://github.com/focu-app/focu-app/releases/download/v${version}/Focu_${version}_aarch64.dmg`);
    }

    fetchVersion();

    const checkMacSilicon = () => {
      const isMac = /Mac/.test(window.navigator.userAgent)
      const hasAppleSilicon = () => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl')
        if (!gl) return false
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (!debugInfo) return false
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        return /Apple/.test(renderer)
      }
      setIsMacSilicon(isMac && hasAppleSilicon())
    }

    checkMacSilicon()
  }, [])

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMacSilicon) {
      e.preventDefault()
      setIsWarningOpen(true)
    }
  }

  return (
    <>
      <a
        href={downloadLink}
        onClick={handleDownloadClick}
        type="button"
        className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Download Now
      </a>

      <WarningDialog
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        downloadLink={downloadLink}
      />
    </>
  )
}

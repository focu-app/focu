"use client";

import AppleLogo from "@/images/appple.svg";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { useEffect, useState } from "react";
import { WarningDialog } from "./warning-dialog";

type DownloadButtonProps = {
  releaseData: {
    version: string;
    pub_date: string;
  } | null;
  gray?: boolean;
  eventCode?: string;
};

export function DownloadButton({
  releaseData,
  gray,
  eventCode = "cta",
}: DownloadButtonProps) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isMacSilicon, setIsMacSilicon] = useState(true);
  const downloadLink = releaseData
    ? `https://github.com/focu-app/focu-app/releases/download/v${releaseData.version}/Focu_${releaseData.version}_aarch64.dmg`
    : "";

  useEffect(() => {
    const checkMacSilicon = () => {
      const isMac = /Mac/.test(window.navigator.userAgent);
      const hasAppleSilicon = () => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (!gl) return false;
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (!debugInfo) return false;
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return /Apple/.test(renderer);
      };
      setIsMacSilicon(isMac && hasAppleSilicon());
    };

    checkMacSilicon();
  }, []);

  const handleDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isMacSilicon) {
      track(`click_download_mac_${eventCode}`);
      window.open(downloadLink, "_blank", "noopener,noreferrer");
    } else {
      track(`click_download_mac_not_supported_${eventCode}`);
      setIsWarningOpen(true);
    }
  };

  const handleConfirmedDownload = () => {
    window.open(downloadLink, "_blank", "noopener,noreferrer");
    setIsWarningOpen(false);
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        type="button"
        className={`{
          w-[180px] flex flex-row rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm ",
          ${gray ? "bg-gray-700 text-white hover:bg-gray-600 focus-visible:outline-gray-600" : "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
        }`}
      >
        <Image src={AppleLogo} alt="Apple Logo" className="w-4 h-4 mr-2" />
        Download for Mac
      </button>

      <WarningDialog
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={handleConfirmedDownload}
        downloadLink={downloadLink}
      />
    </>
  );
}

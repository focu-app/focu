"use client";

import { useEffect, useState } from "react";
import { WarningDialog } from "./warning-dialog";

interface PricingTierButtonProps {
  href: string;
  text: string;
  mostPopular?: boolean;
}

export function PricingTierButton({
  href,
  text,
  mostPopular,
}: PricingTierButtonProps) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isMacSilicon, setIsMacSilicon] = useState(true);

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

  const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isMacSilicon) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      setIsWarningOpen(true);
    }
  };

  const handleConfirmedPurchase = () => {
    window.open(href, "_blank", "noopener,noreferrer");
    setIsWarningOpen(false);
  };

  return (
    <>
      <a
        href={href}
        onClick={handleActionClick}
        target="_blank"
        rel="noreferrer"
        className={`${
          mostPopular
            ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500"
            : "bg-gray-700 text-white hover:bg-gray-600 focus-visible:outline-gray-600"
        } mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
      >
        {text}
      </a>

      <WarningDialog
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={handleConfirmedPurchase}
        downloadLink={href}
        warningType="purchase"
      />
    </>
  );
}

"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export default function FloatingBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const isBannerDismissed =
      localStorage.getItem("bannerDismissed") === "true";
    setIsVisible(!isBannerDismissed);
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem("bannerDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-x-6 bg-indigo-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm/6 text-white">
        <a href="/pricing">
          <strong className="font-semibold">Cyber Monday Sale</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline size-0.5 fill-current"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          Get 50% off only today!
          <span aria-hidden="true">&rarr;</span>
        </a>
      </p>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
          onClick={dismissBanner}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon aria-hidden="true" className="size-5 text-white" />
        </button>
      </div>
    </div>
  );
}

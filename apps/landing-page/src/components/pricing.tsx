"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { WarningDialog } from "./warning-dialog";

interface Tier {
  name: string;
  id: string;
  href: string;
  price: string;
  discount?: string;
  description: string;
  features: string[];
  mostPopular: boolean;
}

const tiers: Tier[] = [
  {
    name: "Individual",
    id: "tier-individual",
    href: "https://focu.lemonsqueezy.com/buy/6c79402c-ca43-4ad7-9e64-680d460ebd57?checkout[discount_code]=BF24",
    price: "$9.79",
    discount: "$19.58",
    description: "Pay once and get lifetime updates.",
    features: [
      "Unlimited Devices",
      "Local AI",
      "Focus Page",
      "Task List",
      "Pomodoro Timer",
      "Keyboard Shortcuts",
    ],
    mostPopular: true,
  },
];

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Pricing() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isMacSilicon, setIsMacSilicon] = useState(true);
  const [currentPurchaseLink, setCurrentPurchaseLink] = useState("");

  useEffect(() => {
    const checkMacSilicon = () => {
      // Check if the device is a Mac
      const isMac = /Mac/.test(window.navigator.userAgent);

      // Check if the device has Apple Silicon
      const hasAppleSilicon = () => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (!gl) return false;
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (!debugInfo) return false;
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return /Apple/.test(renderer);
      };

      // Set the state based on the checks
      setIsMacSilicon(isMac && hasAppleSilicon());
    };

    checkMacSilicon();
  }, []);

  const handlePurchaseClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setCurrentPurchaseLink(href);
    if (isMacSilicon) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      setIsWarningOpen(true);
    }
  };

  const handleConfirmedPurchase = () => {
    window.open(currentPurchaseLink, "_blank", "noopener,noreferrer");
    setIsWarningOpen(false);
  };

  return (
    <div className="bg-gray-900" id="pricing">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Pay once, use forever
          </h2>
        </div>
        <div className="mt-10 rounded-lg p-4 text-center bg-gradient-to-r from-red-700 to-red-600  border-2 border-red-800  hover:border-red-400 block max-w-sm mx-auto">
          <h3 className="text-xl font-semibold leading-8 text-white">
            Black Friday 2024 Offer
          </h3>
          <p className="mt-2 text-lg leading-6 text-white text-bold">
            Ending soon! Save 50% if you buy today.
          </p>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? "bg-gray-800 ring-2 ring-indigo-500"
                  : "bg-gray-800 ring-1 ring-gray-700",
                "rounded-3xl p-8 xl:p-10",
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className="text-lg font-semibold leading-8 text-white"
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                    Most popular
                  </p>
                ) : null}
              </div>

              {/* <p className="mt-4 text-sm leading-6 text-gray-300">
                {tier.description}
              </p> */}
              <div className="mt-6 flex items-baseline gap-x-1">
                {tier.discount && (
                  <span className="ml-2 text-md line-through text-gray-500">
                    {tier.discount}
                  </span>
                )}
                <span className="text-4xl font-bold tracking-tight text-white">
                  {tier.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-300">
                  /once
                </span>
              </div>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                onClick={(e) => handlePurchaseClick(e, tier.href)}
                target="_blank"
                rel="noreferrer"
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500"
                    : "bg-gray-700 text-white hover:bg-gray-600 focus-visible:outline-gray-600",
                  "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                )}
              >
                Buy License
              </a>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-400"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <WarningDialog
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={handleConfirmedPurchase}
        downloadLink={currentPurchaseLink}
        warningType="purchase"
      />
    </div>
  );
}

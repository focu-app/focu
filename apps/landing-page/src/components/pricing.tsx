"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { WarningDialog } from "./warning-dialog";
import { release } from "os";

interface Tier {
  name: string;
  id: string;
  href: string;
  hrefText: string;
  price: string;
  period?: string;
  discount?: string;
  description: string;
  features: string[];
  mostPopular: boolean;
}

const tiers: Tier[] = [
  {
    name: "3 Day Trial",
    id: "tier-trial",
    href: "",
    price: "Free",
    hrefText: "Download",
    period: "",
    description: "Try all features for 3 days without any obligation.",
    features: [
      "3-day trial",
      "Open Source",
      "All features",
      "No credit card required",
    ],
    mostPopular: false,
  },
  {
    name: "Individual",
    id: "tier-individual",
    href: "https://focu.lemonsqueezy.com/buy/6c79402c-ca43-4ad7-9e64-680d460ebd57",
    hrefText: "Buy License",
    price: "$19",
    period: "Once",
    description: "Pay once, support development and get lifetime updates.",
    features: [
      "Unlimited Devices",
      "Open Source",
      "All Features",
      "Priority Updates",
      "Priority Support",
      "Lifetime Updates",
    ],
    mostPopular: true,
  },
  {
    name: "Custom",
    id: "tier-custom",
    href: "mailto:support@focu.app",
    hrefText: "Contact Us",
    price: "Custom",
    period: "",
    description: "For organizations who need a custom solution.",
    features: [
      "Custom Features",
      "Custom Integration",
      "Dedicated Support",
      "SLA",
    ],
    mostPopular: false,
  },
];

const PROMOTIONAL_SETTINGS = {
  blackfriday: {
    title: "Black Friday 2024 Offer",
    message: "Ending soon! Save 50% with code BF24",
    discountCode: "BF24",
    discountPercentage: 50,
    startDate: new Date(2024, 10, 20, 0, 0, 0), // November 20th, 00:00
    endDate: new Date(2024, 11, 2, 0, 0, 0), // December 2nd, 00:00
  },
  cybermonday: {
    title: "Cyber Monday 2024 Offer",
    message: "Only today! Save 50% with lifetime updates",
    discountCode: "CYBERMONDAY",
    discountPercentage: 50,
    startDate: new Date(2024, 11, 2, 0, 0, 0), // December 2nd, 00:00
    endDate: new Date(2024, 11, 3, 20, 0, 0), // December 3rd, 20:00 (8 PM)
  },
  christmas: {
    title: "Christmas 2024 Special",
    message: "End your year on a positive note. Save 30% during the holidays.",
    discountCode: "CHRISTMAS",
    discountPercentage: 30,
    startDate: new Date(2024, 11, 23, 0, 0, 0), // December 23rd, 00:00
    endDate: new Date(2025, 0, 2, 23, 59, 59), // January 2nd, 23:59:59
  },
} as const;

type PromotionalPeriod = keyof typeof PROMOTIONAL_SETTINGS | "none";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

function getPromotionalPeriod(): PromotionalPeriod {
  const now = new Date();

  for (const [period, settings] of Object.entries(PROMOTIONAL_SETTINGS)) {
    if (now >= settings.startDate && now <= settings.endDate) {
      return period as PromotionalPeriod;
    }
  }

  return "none";
}

function getEndTime(): Date | null {
  const period = getPromotionalPeriod();
  return period === "none" ? null : PROMOTIONAL_SETTINGS[period].endDate;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endTime = getEndTime();
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className="flex justify-center gap-4 mt-4">
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.days}</span>
        <span className="text-sm ml-1">days</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.hours}</span>
        <span className="text-sm ml-1">hrs</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
        <span className="text-sm ml-1">min</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.seconds}</span>
        <span className="text-sm ml-1">sec</span>
      </div>
    </div>
  );
}

function getDiscountedPrice(originalPrice: string): string {
  const period = getPromotionalPeriod();
  if (period === "none") return originalPrice;

  const price = Number.parseFloat(originalPrice.replace("$", ""));
  const discountMultiplier =
    (100 - PROMOTIONAL_SETTINGS[period].discountPercentage) / 100;
  return `$${(price * discountMultiplier).toFixed(2)}`;
}

function getPromoDetails() {
  const period = getPromotionalPeriod();
  return period === "none" ? null : PROMOTIONAL_SETTINGS[period];
}

export function Pricing() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isMacSilicon, setIsMacSilicon] = useState(true);
  const [currentPurchaseLink, setCurrentPurchaseLink] = useState("");
  const [releaseData, setReleaseData] = useState<{
    version: string;
    pub_date: string;
  } | null>(null);

  const promoDetails = getPromoDetails();

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

  useEffect(() => {
    // Fetch the latest release data
    fetch("https://focu.app/api/latest-release")
      .then((response) => response.json())
      .then((data) => {
        setReleaseData(data);
        setCurrentPurchaseLink(
          `https://github.com/focu-app/focu-app/releases/download/v${data.version}/Focu_${data.version}_aarch64.dmg`,
        );
      })
      .catch((error) => console.error("Error fetching release data:", error));
  }, []);

  const handleActionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tier: Tier,
  ) => {
    e.preventDefault();
    if (tier.id === "tier-trial") {
      setCurrentPurchaseLink(
        releaseData
          ? `https://github.com/focu-app/focu-app/releases/download/v${releaseData.version}/Focu_${releaseData.version}_aarch64.dmg`
          : "",
      );
    } else {
      setCurrentPurchaseLink(tier.href);
    }

    if (isMacSilicon) {
      window.open(currentPurchaseLink, "_blank", "noopener,noreferrer");
    } else {
      setIsWarningOpen(true);
    }
  };

  console.log(releaseData);
  console.log(currentPurchaseLink);

  const handleConfirmedPurchase = () => {
    window.open(currentPurchaseLink, "_blank", "noopener,noreferrer");
    setIsWarningOpen(false);
  };

  // Update tier price and href based on promotional period
  const currentTiers = tiers.map((tier) => {
    const period = getPromotionalPeriod();
    const baseHref = tier.href;

    return {
      ...tier,
      price: period !== "none" ? getDiscountedPrice(tier.price) : tier.price,
      discount: period !== "none" ? tier.price : undefined,
      href:
        period !== "none"
          ? `${baseHref}?checkout[discount_code]=${promoDetails?.discountCode}`
          : baseHref,
    };
  });

  return (
    <div className="bg-gray-900" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Pay Once, Use Forever
          </h2>
        </div>
        {promoDetails && (
          <div className="mt-10 rounded-lg p-4 text-center bg-gradient-to-r from-red-700 to-red-600  border-2 border-red-800  hover:border-red-400 block max-w-sm mx-auto">
            <h3 className="text-xl font-semibold leading-8 text-white">
              {promoDetails.title}
            </h3>
            <p className="mt-2 text-lg leading-6 text-white text-bold">
              {promoDetails.message}
            </p>
          </div>
        )}

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {currentTiers.map((tier) => (
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
              {tier.description && (
                <p className="mt-4 text-sm/6 text-gray-300">
                  {tier.description}
                </p>
              )}
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
                  {tier.period && `/${tier.period}`}
                </span>
              </div>
              <a
                href={tier.href || currentPurchaseLink}
                aria-describedby={tier.id}
                onClick={(e) => handleActionClick(e, tier)}
                target="_blank"
                rel="noreferrer"
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500"
                    : "bg-gray-700 text-white hover:bg-gray-600 focus-visible:outline-gray-600",
                  "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                )}
              >
                {tier.hrefText}
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
        warningType={
          currentPurchaseLink.includes("releases/download")
            ? "download"
            : "purchase"
        }
      />
    </div>
  );
}

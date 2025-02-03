import { CheckIcon } from "@heroicons/react/20/solid";
import { CountdownTimer } from "./countdown-timer";
import { PricingTierButton } from "./pricing-tier-button";
import { DownloadButton } from "./download-button";

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

async function getReleaseData() {
  const response = await fetch("https://focu.app/api/latest-release");
  const data = await response.json();
  return data;
}

export async function Pricing() {
  const promoDetails = getPromoDetails();
  const releaseData = await getReleaseData();
  const endTime = getEndTime();

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
            Simple Pricing
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
            {endTime && <CountdownTimer endTime={endTime} />}
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

              {tier.id === "tier-trial" ? (
                <div className="mt-6">
                  <DownloadButton
                    releaseData={releaseData}
                    gray
                    eventCode="pricing_page"
                  />
                </div>
              ) : (
                <PricingTierButton
                  href={tier.href}
                  text={tier.hrefText}
                  mostPopular={tier.mostPopular}
                />
              )}

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
    </div>
  );
}

import { CheckIcon } from "@heroicons/react/20/solid";
import { DownloadButton } from "./download-button";
import { PricingTierButton } from "./pricing-tier-button";

interface Tier {
  name: string;
  id: string;
  href: string;
  hrefText: string;
  price: string;
  originalPrice?: string;
  period?: string;
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
    originalPrice: "$29",
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

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

async function getReleaseData() {
  const response = await fetch("https://focu.app/api/latest-release");
  const data = await response.json();
  return data;
}

export async function Pricing() {
  const releaseData = await getReleaseData();

  return (
    <div className="bg-gray-900" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Simple Pricing
          </h2>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
              {tier.description && (
                <p className="mt-4 text-sm/6 text-gray-300">
                  {tier.description}
                </p>
              )}
              <div className="mt-6 flex items-baseline gap-x-1">
                {tier.originalPrice && (
                  <span className="text-lg line-through text-gray-500">
                    {tier.originalPrice}
                  </span>
                )}
                <span className="text-4xl font-bold tracking-tight text-white ml-2">
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

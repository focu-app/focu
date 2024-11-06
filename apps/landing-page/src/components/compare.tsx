import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface ComparisonFeature {
  name: string;
  focuHas: boolean;
  othersHave: boolean;
}

const features: ComparisonFeature[] = [
  {
    name: "Distraction blocking",
    focuHas: true,
    othersHave: true,
  },
  {
    name: "Time tracking",
    focuHas: true,
    othersHave: true,
  },
  {
    name: "AI-powered focus insights",
    focuHas: true,
    othersHave: false,
  },
  {
    name: "Cross-platform sync",
    focuHas: true,
    othersHave: false,
  },
  {
    name: "Privacy-first approach",
    focuHas: true,
    othersHave: false,
  },
];

export function Compare() {
  return (
    <section className="py-24 bg-gray-900 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Why Choose Focu?
          </h2>
        </div>

        <div className="mt-16 overflow-x-auto">
          <table className="w-full max-w-2xl mx-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-gray-300">Feature</th>
                <th className="px-6 py-4 text-center text-gray-300">Focu</th>
                <th className="px-6 py-4 text-center text-gray-300">
                  Other Apps
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={`${
                    index !== features.length - 1
                      ? "border-b border-gray-700"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-300">{feature.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <CheckIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {feature.othersHave ? (
                        <CheckIcon className="w-6 h-6 text-indigo-400" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

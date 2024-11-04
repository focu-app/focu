const links = [
  { name: "Feedback", href: "https://focu.featurebase.app" },
  { name: "Changelog", href: "https://focu.featurebase.app/changelog" },
  { name: "Roadmap", href: "https://focu.featurebase.app/roadmap" },
  {
    name: "All releases",
    href: "https://github.com/focu-app/focu-app/releases",
  },
];

export function Community() {
  return (
    <div className="mt-16 flex justify-center w-full" id="community">
      <div className="flex flex-col gap-4 text-center">
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Be part of the community
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">
          Help us improve the app by giving feedback, check what's new, and see
          the roadmap.
        </p>
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-semibold leading-6 text-white"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

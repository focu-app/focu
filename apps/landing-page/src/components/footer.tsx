const footerNavigation = {
  links: [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Pricing",
      href: "#pricing",
    },
    {
      name: "Contact",
      href: "mailto:support@focu.app",
    },
  ],
  social: [
    {
      name: "X",
      href: "https://x.com/martin_buur",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <title>X</title>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer aria-labelledby="footer-heading" className="relative">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-4 lg:px-8">
        <div className="border-t border-white/10 pt-8 flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            {footerNavigation.links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex space-x-6">
            {footerNavigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="h-6 w-6" />
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            &copy; 2024 Focu App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

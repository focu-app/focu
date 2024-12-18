import Image from "next/image";
import logo from "@/images/logo.png";

const navigation = {
  solutions: [
    { name: "Features", href: "/feature" },
    { name: "Pricing", href: "/pricing" },
    { name: "Demo", href: "/#demo" },
  ],
  support: [
    // { name: "Documentation", href: "https://focu.featurebase.app/help" },
    { name: "Email Support", href: "mailto:support@focu.app" },
    { name: "FAQ", href: "/#faq" },
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "https://focu.featurebase.app/changelog" },
    { name: "Roadmap", href: "https://focu.featurebase.app/roadmap" },
    { name: "Feedback", href: "https://focu.featurebase.app" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
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
    {
      name: "GitHub",
      href: "https://github.com/focu-app/focu-app",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <title>GitHub</title>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Reddit",
      href: "https://www.reddit.com/r/focuapp/",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <title>Reddit</title>
          <path
            fill="currentColor"
            d="M12.008 16.521a3.84 3.84 0 0 0 2.47-.77v.04a.281.281 0 0 0 .005-.396.281.281 0 0 0-.395-.005 3.291 3.291 0 0 1-2.09.61 3.266 3.266 0 0 1-2.081-.63.27.27 0 0 0-.38.381 3.84 3.84 0 0 0 2.47.77Z"
          />
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-4.845-1.407A1.463 1.463 0 0 1 18.67 12a1.46 1.46 0 0 1-.808 1.33c.01.146.01.293 0 .44 0 2.242-2.61 4.061-5.829 4.061s-5.83-1.821-5.83-4.061a3.25 3.25 0 0 1 0-.44 1.458 1.458 0 0 1-.457-2.327 1.458 1.458 0 0 1 2.063-.064 7.163 7.163 0 0 1 3.9-1.23l.738-3.47v-.006a.31.31 0 0 1 .37-.236l2.452.49a1 1 0 1 1-.132.611l-2.14-.45-.649 3.12a7.11 7.11 0 0 1 3.85 1.23c.259-.246.6-.393.957-.405Z"
            clipRule="evenodd"
          />
          <path
            fill="currentColor"
            d="M15.305 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-4.625 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
          />
        </svg>
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <Image src={logo} alt="Focu App" width={32} height={32} />
              <div className="text-2xl font-bold text-white">Focu</div>
            </div>

            <p className="text-sm text-gray-300">Follow us on social media.</p>
            <div className="flex gap-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300"
                  target={item.href.startsWith("http") ? "_blank" : "_self"}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white">Product</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-400 hover:text-white"
                        target={
                          item.href.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-white">Support</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-400 hover:text-white"
                        target={
                          item.href.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white">Company</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-400 hover:text-white"
                        target={
                          item.href.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-white">Legal</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-400 hover:text-white"
                        target={
                          item.href.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Focu App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

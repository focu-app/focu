const testimonials = [
  {
    body: "Focu helped me get over mental hurdles that otherwise wouldn't have been possible with a traditional productivity app.",
    author: {
      name: "Kristina C.",
      handle: "kristinachen",
    },
  },
  {
    body: "The gentle AI conversations helped me break through procrastination in ways I never expected. It feels like having a mindful friend.",
    author: {
      name: "David P.",
      handle: "davidpark",
    },
  },
  {
    body: "Finally found an app that understands productivity is about mindset, not just checking off tasks. The morning reflections changed my entire day.",
    author: {
      name: "Sarah M.",
      handle: "sarahmiller",
    },
  },
  {
    body: "As someone who struggled with anxiety around productivity, Focu's mindful approach helped me find peace with my work rhythm.",
    author: {
      name: "Michael T.",
      handle: "michaeltorres",
    },
  },
  {
    body: "The difference is in the conversations - they're thoughtful and personal. It's not just another AI chatbot, it's a mindful companion.",
    author: {
      name: "Emma W.",
      handle: "emmawilson",
    },
  },
  {
    body: "Transformed my chaotic mornings into peaceful, intentional starts. The AI feels like a mentor who really understands my challenges.",
    author: {
      name: "Alex Z.",
      handle: "alexzhang",
    },
  },
];

export function Testimonials() {
  return (
    <div className="relative isolate pb-32 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
          }}
          className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Testimonials
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">
            See what people are saying about Focu.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-8 text-sm/6 text-white sm:mt-20 lg:grid-cols-3 xl:mx-0 xl:max-w-none">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author.handle}
              className="rounded-2xl bg-gray-800 p-6 shadow-lg hover:border-indigo-500 hover:shadow-lg"
            >
              <blockquote className="text-white">
                <p className="text-pretty text-lg">{`"${testimonial.body}"`}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4 border-t border-white/25 pt-6">
                <div className="flex items-center gap-x-3">
                  <div className="font-semibold">{testimonial.author.name}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

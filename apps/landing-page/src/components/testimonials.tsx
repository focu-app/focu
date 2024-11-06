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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-white">Testimonials</h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">
            See what people are saying about Focu.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-8 text-sm/6 text-white sm:mt-20 lg:grid-cols-3 xl:mx-0 xl:max-w-none">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author.handle}
              className="rounded-2xl bg-gray-800 border-2 border-gray-700 p-6 shadow-lg ring-1 hover:border-indigo-500 hover:shadow-lg"
            >
              <blockquote className="text-white">
                <p className="text-pretty">{`"${testimonial.body}"`}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <div>
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

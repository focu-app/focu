import { StarIcon } from "@heroicons/react/20/solid";

export function Testimonial() {
  return (
    <section className="px-6 text-center">
      <figure className="mx-auto max-w-2xl">
        <p className="sr-only">5 out of 5 stars</p>
        <div className="flex justify-center gap-x-1 text-indigo-600">
          <StarIcon aria-hidden="true" className="h-5 w-5 flex-none" />
          <StarIcon aria-hidden="true" className="h-5 w-5 flex-none" />
          <StarIcon aria-hidden="true" className="h-5 w-5 flex-none" />
          <StarIcon aria-hidden="true" className="h-5 w-5 flex-none" />
          <StarIcon aria-hidden="true" className="h-5 w-5 flex-none" />
        </div>
        <blockquote className="mt-4 text-xl/8 font-semibold tracking-tight text-white sm:text-2xl/9">
          <p>
            &quot;Focu helped me get over mental hurdles that otherwise wouldn't
            have been possible with a traditional productivity app.&quot;
          </p>
        </blockquote>
        <figcaption className="mt-4 flex justify-center items-center gap-x-6">
          <div className="text-sm/6">
            <span className="text-gray-400">—</span>
            <div className="font-semibold text-white">
              Kristina, UX Designer
            </div>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}

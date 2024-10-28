import { Suspense } from "react";
import { Video } from "./video";

export function Demo() {
  return (
    <div
      className="mt-16 max-w-4xl mx-auto flex justify-center w-full"
      id="demo"
    >
      <div className="flex flex-col gap-4 text-center">
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Focu in action
        </h2>
        <p className="my-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          Quick demo showing off a morning intention session. Everything is
          running locally on your own Mac, it works offline and no data is ever
          sent to us.
        </p>
        <Suspense>
          <Video fileName="Focu Demo 8" />
        </Suspense>
      </div>
    </div>
  );
}

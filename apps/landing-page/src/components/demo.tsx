import { Suspense } from "react";
import { Video } from "./video";

export function Demo() {
  return (
    <div
      className="mt-16 max-w-4xl mx-auto flex justify-center w-full p-4"
      id="demo"
    >
      <div className="flex flex-col gap-4 text-center">
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Focu in action
        </h2>
        <p className="my-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8 max-w-xl mx-auto">
          Below is a demo showing off a check-in session. You can initiate the
          check-in on your own or have it periodically asked.
        </p>
        <Suspense>
          <Video fileName="focu v0.4.0 check-in demo high 1080p" autoPlay />
        </Suspense>
      </div>
    </div>
  );
}

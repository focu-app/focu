import { Suspense } from "react";
import { Video } from "./video";

export function KeyboardShortcutsDemo() {
  return (
    <div className="mt-16 flex justify-center w-full" id="keyboard-shortcuts">
      <div className="flex flex-col gap-4 text-center">
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Keyboard shortcuts
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">
          Control the app with keyboard shortcuts and speed up your workflow.
        </p>
        <Suspense>
          <Video fileName="Focu Demo 3" />
        </Suspense>
      </div>
    </div>
  );
}

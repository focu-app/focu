import { ArrowRightIcon } from "@heroicons/react/20/solid";

export function Problems() {
  return (
    <div className="bg-gray-900 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Are You Tired Of...
        </h2>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 mt-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex justify-end">
                <div className="inline-flex text-white text-xl bg-red-500 border border-white/10 rounded-full py-4 px-6">
                  Procastinating every morning?
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full p-2">
                <ArrowRightIcon className="w-10 h-10" />
              </div>
              <div className="flex-1 flex justify-start">
                <div className="inline-flex text-white text-xl bg-gray-700 border border-white/10 rounded-full py-4 px-6">
                  Use Focu to start your morning with intention
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex justify-end">
                <div className="inline-flex text-white text-xl bg-red-500 border border-white/10 rounded-full py-4 px-6">
                  Wasting time on the wrong tasks?
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full p-2">
                <ArrowRightIcon className="w-10 h-10" />
              </div>
              <div className="flex-1 flex justify-start">
                <div className="inline-flex text-white text-xl bg-gray-700 border border-white/10 rounded-full py-4 px-6">
                  Use Focu to figure out the most important tasks
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex justify-end">
                <div className="inline-flex text-white text-xl bg-red-500 border border-white/10 rounded-full py-4 px-6">
                  Getting distracted during the day?
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full p-2">
                <ArrowRightIcon className="w-10 h-10" />
              </div>
              <div className="flex-1 flex justify-start">
                <div className="inline-flex text-white text-xl bg-gray-700 border border-white/10 rounded-full py-4 px-6">
                  Use Focu's check-in to be reminded of your goals
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex justify-end">
                <div className="inline-flex text-white text-xl bg-red-500 border border-white/10 rounded-full py-4 px-6">
                  Not being able to focus?
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full p-2">
                <ArrowRightIcon className="w-10 h-10" />
              </div>
              <div className="flex-1 flex justify-start">
                <div className="inline-flex text-white text-xl bg-gray-700 border border-white/10 rounded-full py-4 px-6">
                  Use Focu's Pomodoro timer to stay focused
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

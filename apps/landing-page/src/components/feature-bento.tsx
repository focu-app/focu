export function FeatureBento() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-400">Features</h2>
        <p className="mt-2 max-w-lg text-pretty text-4xl font-medium tracking-tight text-white sm:text-5xl">
          Everything you need throughout your day.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <div className="flex p-px lg:col-span-4">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]">
              <img
                alt=""
                src="/images/focus.png"
                className="object-cover object-left"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Task List</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                  A simple task list to keep track of your tasks.
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Input tasks yourself or use AI to extract them from your conversations.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-tr-[2rem]">
              <img
                alt=""
                src="/images/menu-bar.png"
                className="object-cover object-center"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Pomodoro Timer</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">Always in your menu bar</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  The built-in pomodoro timer lives in your menu bar, so you can focus on your work.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-bl-[2rem]">
              <img
                alt=""
                src="https://tailwindui.com/plus/img/component-images/bento-02-security.png"
                className="h-80 object-cover object-center"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Security</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">Advanced access control</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-4">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]">
              <img
                alt=""
                src="https://tailwindui.com/plus/img/component-images/bento-02-performance.png"
                className="h-80 object-cover object-left"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Performance</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">Lightning-fast builds</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Sed congue eros non finibus molestie. Vestibulum euismod augue vel commodo vulputate. Maecenas at
                  augue sed elit dictum vulputate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

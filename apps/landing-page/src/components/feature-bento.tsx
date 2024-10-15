import Image from "next/image";
import FocusImage from "@/images/focus.png";
import PomodoroImage from "@/images/menu-bar-3.png";
import ExtractTasksImage from "@/images/extract-tasks.png";
import KeyboardShortcutsImage from "@/images/keyboard-shortcuts.png";
import LightModeImage from "@/images/light-mode.png";
import CustomizableImage from "@/images/customizable.png";

export function FeatureBento() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-400">Features</h2>
        <p className="mt-2 max-w-lg text-pretty text-4xl font-medium tracking-tight text-white sm:text-5xl">
          Everything you need throughout your day.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]">

                <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image 
                  alt=""
                  src={FocusImage}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Focus Page</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                  A focus page with a task list and pomodoro timer
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Input tasks yourself or use AI to extract them from your conversations.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-tr-[2rem]">
              <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image 
                  alt=""
                  src={PomodoroImage}
                  className="object-cover w-full h-full"
                />
              </div>
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
              <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image alt="" className="object-cover w-full h-full" src={ExtractTasksImage} />
              </div>
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Extract Tasks</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">Extract tasks automatically</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  AI can extract tasks from your conversations and add them to your task list.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]">
              <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image alt="" className="object-cover w-full h-full" src={KeyboardShortcutsImage} />
              </div>
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Keyboard Shortcuts</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                  Be more productive with keyboard shortcuts
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  With keyboard shortcuts, you can focus on your work and avoid distractions.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-bl-[2rem]">
              <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image alt="" className="object-cover w-full h-full" src={LightModeImage} />
              </div>
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Dark & Light Mode</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                  Automatic dark or light mode
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Choose your preferred mode or let the app decide for you.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2"> 
            <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-br-[2rem]">
              <div className="overflow-hidden rounded-lg h-72 w-full">
                <Image alt="" className="object-cover w-full h-full" src={CustomizableImage} />
              </div>
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-400">Customizable</h3>
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                  Customize the app to your liking
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                  Focu works out of the box but advanced users can choose their own AI models and set the system prompts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

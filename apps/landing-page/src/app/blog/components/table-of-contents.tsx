"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

type TocItem = {
  text: string;
  level: number;
  slug: string;
};

interface TableOfContentsProps {
  toc: TocItem[];
  className?: string;
}

export function TableOfContents({ toc, className }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`flex flex-col ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-gray-800/50 px-4 py-2 text-sm font-medium text-white lg:hidden"
      >
        <span>Table of Contents</span>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>

      <p className="hidden font-semibold text-white lg:block">
        Table of Contents
      </p>

      <div className={`mt-2 space-y-2 ${isOpen ? "block" : "hidden lg:block"}`}>
        {toc.map((item) => (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            className="block text-sm text-gray-400 hover:text-white transition-colors"
            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
            onClick={() => setIsOpen(false)}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

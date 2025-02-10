"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./testimonials.css";
import type { StaticImageData } from "next/image";

// Import testimonial images
import jakubenkooImg from "../images/testimonials/jakubenkoo.png";
import abhayImg from "../images/testimonials/abhay.jpeg";
import staceyImg from "../images/testimonials/stacey.jpeg";
import reoKurasawaImg from "../images/testimonials/reo_kurasawa.jpeg";
import kristinaImg from "../images/testimonials/kristina.webp";
import bryanMcanultyImg from "../images/testimonials/bryan_mcanulty.jpeg";
import drDishantImg from "../images/testimonials/dr_dishant.png";
import dishantpandya777Img from "../images/testimonials/dishantpandya777.png";
import downtownrobImg from "../images/testimonials/downtownrob.png";
import jujudelgadoImg from "../images/testimonials/jujudelgado.png";
import aviorrokImg from "../images/testimonials/aviorrok.png";
import entityunnamedImg from "../images/testimonials/entityunnamed.png";
import galacticGuardian404Img from "../images/testimonials/galactic-guardian404.png";

type Testimonial = {
  integration?: string;
  text: string;
  url?: string;
  date: string;
  customer_name: string;
  customer_avatar?: string | StaticImageData;
};

const testimonials: Testimonial[] = [
  {
    integration: "Reddit",
    text: "I keep tinkering with the app and I totally love it :D",
    date: "2025-02-03T14:54:25.000Z",
    customer_name: "jakubenkoo",
    customer_avatar: jakubenkooImg,
  },
  {
    integration: "Twitter",
    text: "there's something about the combo of this featureset i'm finding quite supportive: interstitial journaling, fully local llm, pomo timer, task extraction, gentle nudges",
    url: "https://x.com/abhayance/status/1876988543182012768",
    date: "2025-01-08T13:45:16.000Z",
    customer_name: "abhay",
    customer_avatar: abhayImg,
  },
  {
    integration: "Twitter",
    text: "@aliszu @martin_buur I got this during Black Friday! I love using it. Makes me feel like I'm chatting to someone before my work day begins.",
    url: "https://x.com/MonfangOCE/status/1869353483109019653",
    date: "2024-12-18T12:06:15.000Z",
    customer_name: "Stacey",
    customer_avatar: staceyImg,
  },
  {
    integration: "Twitter",
    text: "@martin_buur I discovered your app on Product Hunt and absolutely love it!\n\nIt seems like using Focu could significantly boost my productivity😍",
    url: "https://x.com/reokurasawa/status/1864821893834088448",
    date: "2024-12-05T23:59:20.000Z",
    customer_name: "RΞO KURΛSΛWΛ",
    customer_avatar: reoKurasawaImg,
  },
  {
    text: "Focu helped me get over mental hurdles that otherwise wouldn't have been possible with a traditional productivity app.",
    date: "2024-12-02T07:22:46.981Z",
    customer_name: "Kristina",
    customer_avatar: kristinaImg,
  },
  {
    integration: "Twitter",
    text: "@martin_buur @byalexai Cool idea. You should be charging more!",
    url: "https://x.com/BryanMcAnulty/status/1862539764718592456",
    date: "2024-11-29T16:50:58.000Z",
    customer_name: "Bryan McAnulty",
    customer_avatar: bryanMcanultyImg,
  },
  {
    integration: "Twitter",
    text: "@martin_buur Your product is awesome… I literally can't deny to use a single time…Every time I open my Mac and Focu App tingles me softly… It feels like a Breeze…! ✨😊❤️👏🏻💫💥🌟🙂🤗\n\nAmazing App! ❤️",
    url: "https://x.com/dishantpandya7/status/1862462987551805539",
    date: "2024-11-29T11:45:53.000Z",
    customer_name: "Dr. Dishant",
    customer_avatar: drDishantImg,
  },
  {
    integration: "Reddit",
    text: "Nice App and I immediately grabbed a Lifetime License to support you! :)",
    date: "2024-11-26T12:27:48.000Z",
    customer_name: "dishantpandya777",
    customer_avatar: dishantpandya777Img,
  },
  {
    integration: "Reddit",
    text: "This looks great, I'll try it out. 😁\n\nEdit: Purchased!",
    date: "2024-11-14T07:07:15.000Z",
    customer_name: "downtownrob",
    customer_avatar: downtownrobImg,
  },
  {
    text: "I am loving the Focu app! Will definitely buy another copy for my son if/when it comes to Windows. Keep at it this app is great!",
    date: "2024-11-13T07:27:45.078Z",
    customer_name: "Anonymous",
  },
  {
    integration: "Reddit",
    text: 'So far so good, I like it. I was just looking for a "journal" app and this one is amazing. I\'m learning that AI is helping me a lot in my "absurd" questions and life and helping cope better with my PTSD.',
    date: "2024-11-12T17:19:25.000Z",
    customer_name: "jujudelgado",
    customer_avatar: jujudelgadoImg,
  },
  {
    integration: "Reddit",
    text: "Great! Love to see things like that",
    date: "2024-11-11T21:27:39.000Z",
    customer_name: "Aviorrok",
    customer_avatar: aviorrokImg,
  },
  {
    integration: "Reddit",
    text: "This is so great - thank you for building it! Bought!",
    date: "2024-11-11T18:09:29.000Z",
    customer_name: "entityunnamed",
    customer_avatar: entityunnamedImg,
  },
  {
    integration: "Reddit",
    text: "I will be buying this right after I get the kids off to school!  Glad I found your post on it.",
    date: "2024-11-11T14:10:37.000Z",
    customer_name: "Galactic-Guardian404",
    customer_avatar: galacticGuardian404Img,
  },
  {
    text: "I used it for the first time to organize my day for the holiday and it's super helpful.\n\nI even asked if how I should prioritize work and it was able to give me a response that priorities work life balance so I'm really happy with it so far. Thanks for creating something so awesome!",
    date: "2024-11-11T07:26:41.727Z",
    customer_name: "Anonymous",
  },
];

export function Testimonials() {
  const [randomizedTestimonials, setRandomizedTestimonials] =
    useState(testimonials);

  useEffect(() => {
    setRandomizedTestimonials(
      [...testimonials].sort(() => Math.random() - 0.5),
    );
  }, []);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative isolate pb-32 pt-24 sm:pt-32 max-w-6xl mx-auto">
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
      <div className="mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Testimonials
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">
            See what people are saying about Focu.
          </p>
        </div>
        <div className="flex items-center justify-end gap-4 mt-8 mb-4">
          <button
            onClick={() => scroll("left")}
            type="button"
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            type="button"
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div
          className="mx-auto overflow-x-auto scroll-container"
          ref={scrollContainerRef}
        >
          <div className="flex items-start space-x-8">
            {randomizedTestimonials.map((testimonial, index) => (
              <figure
                key={`${testimonial.customer_name}-${index}`}
                className="min-w-[300px] mb-8 rounded-2xl bg-gray-800 p-6 shadow-lg hover:border-indigo-500 hover:shadow-lg"
              >
                <div className="flex items-center gap-x-4 mb-2">
                  {testimonial.customer_avatar ? (
                    <Image
                      className="h-10 w-10 shrink-0 rounded-full bg-gray-700 object-cover"
                      src={testimonial.customer_avatar}
                      alt={testimonial.customer_name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-lg text-white">
                        {testimonial.customer_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-y-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {testimonial.customer_name}
                    </div>
                    {testimonial.integration && (
                      <div className="text-sm text-gray-400">
                        via {testimonial.integration}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="flex text-yellow-400 mb-4"
                  aria-label="5 out of 5 stars rating"
                >
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-white">
                  <p className="text-pretty text-lg">{testimonial.text}</p>
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FloatingBanner() {
  const today = new Date();
  const isDecember = today.getMonth() === 11; // December is 11 (0-based)
  const isJanuary = today.getMonth() === 0; // January is 0
  const date = today.getDate();
  const hours = today.getHours();

  // Christmas promotion (December 24th to January 2nd)
  if ((isDecember && date >= 24) || (isJanuary && date <= 2)) {
    return (
      <div className="flex items-center gap-x-6 bg-red-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
        <p className="text-sm/6 text-white">
          <a href="/pricing">
            <strong className="font-semibold">End of the year sale</strong>
            <svg
              viewBox="0 0 2 2"
              aria-hidden="true"
              className="mx-2 inline size-0.5 fill-current"
            >
              <circle r={1} cx={1} cy={1} />
            </svg>
            Save 30% until January 2nd!
            <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <div className="flex flex-1 justify-end" />
      </div>
    );
  }

  if (
    isDecember &&
    (date === 2 || // All of Monday
      (date === 3 && hours < 12)) // Until noon on Tuesday
  ) {
    // Cyber Monday (December 2nd) and until noon on Tuesday (December 3rd)
    return (
      <div className="flex items-center gap-x-6 bg-indigo-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
        <p className="text-sm/6 text-white">
          <a href="/pricing">
            <strong className="font-semibold">Cyber Monday Sale</strong>
            <svg
              viewBox="0 0 2 2"
              aria-hidden="true"
              className="mx-2 inline size-0.5 fill-current"
            >
              <circle r={1} cx={1} cy={1} />
            </svg>
            Get 50% off only today!
            <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <div className="flex flex-1 justify-end" />
      </div>
    );
  }

  return null;
}

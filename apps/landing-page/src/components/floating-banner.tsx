export default function FloatingBanner() {
  const today = new Date();
  const year = 2024;
  const isDecember = today.getMonth() === 11; // December is 11 (0-based)
  const date = today.getDate();
  const hours = today.getHours();

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

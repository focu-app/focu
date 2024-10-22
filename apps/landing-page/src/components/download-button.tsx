export async function DownloadButton() {
  const result = await fetch("https://focu.app/api/latest-release");
  

  const { version } = await result.json();

  return (
    <a href={`https://github.com/focu-app/focu-app/releases/download/v${version}/Focu_${version}_aarch64.dmg`}
      type="button"
      className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
    >
      Download Now
    </a>
  );
}

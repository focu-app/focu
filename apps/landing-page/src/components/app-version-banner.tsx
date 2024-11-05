import { format } from "date-fns";

type AppVersionBannerProps = {
  releaseData: {
    version: string;
    pub_date: string;
    size: number;
  };
};

export function AppVersionBanner({ releaseData }: AppVersionBannerProps) {
  const { version, pub_date, size } = releaseData;

  return (
    <pre className="text-sm text-gray-400">
      v{version} - {format(new Date(pub_date), "d MMM yyyy")} |{" "}
      {(size / 1000000).toFixed(2)} MB
    </pre>
  );
}

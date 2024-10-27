import { format } from "date-fns";

type AppVersionBannerProps = {
  releaseData: {
    version: string;
    pub_date: string;
  };
}

export function AppVersionBanner({ releaseData }: AppVersionBannerProps) {
  const { version, pub_date } = releaseData;
  
  return (
    <pre className="text-sm text-gray-400">
      v{version} - {format(new Date(pub_date), "d MMM yyyy")} | MacOS 14+
    </pre>
  );
}

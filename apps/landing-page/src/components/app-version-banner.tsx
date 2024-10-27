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
      v{version} - {new Date(pub_date).toLocaleDateString()} | MacOS 14+
    </pre>
  );
}

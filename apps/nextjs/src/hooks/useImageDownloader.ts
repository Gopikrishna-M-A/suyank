import { useCallback, useState } from "react";

import { toast } from "@acme/ui/toast";

const useImageDownloader = () => {
  const [loading, setLoading] = useState(false);

  const downloadImage = useCallback(
    async (imageName: string, imageUrl: string | URL | Request) => {
      setLoading(true);
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Meme downloaded");
      } catch (error) {
        console.error("Error downloading the image:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { downloadImage, loading };
};

export default useImageDownloader;

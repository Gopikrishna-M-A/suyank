import { useCallback, useState } from "react";

import { toast } from "@acme/ui/toast";

const useImageClipboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const copyImageToClipboard = useCallback(
    async (imageUrl: string | URL | Request) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);

        toast.success("Meme copied");
      } catch (error) {
        setError(error);
        console.error("Error copying the image to clipboard:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { copyImageToClipboard, loading, error };
};

export default useImageClipboard;

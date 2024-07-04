"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";

interface TextPosition {
  x: number;
  y: number;
}

const ImageEditor: React.FC = () => {
  const searchParams = useSearchParams();

  const memeId = searchParams.get("editMemeId");

  const { data: meme, isFetching } = api.meme.byId.useQuery(
    {
      id: memeId || "",
    },
    {
      enabled: Boolean(memeId),
    },
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState<string>("");
  const [textPosition, setTextPosition] = useState<TextPosition>({
    x: 50,
    y: 50,
  });
  const [textColor, setTextColor] = useState<string>("#000000");
  const [loading, setLoading] = useState(false);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.font = "20px Arial";
      ctx.fillStyle = textColor;
      ctx.fillText(text, textPosition.x, textPosition.y);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setLoading(true);

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const imageElement = new Image();
      imageElement.src = URL.createObjectURL(blob);

      imageElement.onload = () => {
        setImage(imageElement);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTextColor(e.target.value);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setTextPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document?.createElement("a");
      link.download = "image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [image, text, textPosition, textColor]);

  useEffect(() => {
    if (meme?.image) {
      handleImageUpload(meme?.image);
    }
  }, [meme?.image]);

  return (
    <div>
      {/* <input type="file" onChange={handleImageUpload} /> */}

      <div className="mb-4 flex items-center gap-2">
        <Input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text"
          className="max-w-[300px]"
        />

        <Input
          type="color"
          value={textColor}
          onChange={handleColorChange}
          className="max-w-[80px]"
        />

        <span className="text-body2">(Click to position text)</span>
      </div>

      {isFetching || loading ? (
        <div>Processing Image...</div>
      ) : (
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onClick={handleCanvasClick}
          style={{ border: "1px solid black" }}
        />
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={handleDownload}>Download Meme</Button>
      </div>
    </div>
  );
};

export default ImageEditor;

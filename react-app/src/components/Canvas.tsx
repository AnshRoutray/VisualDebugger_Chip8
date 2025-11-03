import { useEffect } from "react";

interface CanvasProp {
  reference: React.RefObject<HTMLCanvasElement | null>;
  canvas_width: string;
  canvas_height: string;
}

const Canvas = ({ reference, canvas_width, canvas_height }: CanvasProp) => {
  useEffect(() => {
    console.log("rendered");
  }, []);
  return (
    <canvas
      width={canvas_width}
      height={canvas_height}
      ref={reference}
      style={{
        width: canvas_width + "px", // Displayed size
        height: canvas_height + "px",
      }}
    ></canvas>
  );
};

export default Canvas;

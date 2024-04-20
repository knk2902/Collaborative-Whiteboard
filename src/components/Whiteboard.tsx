import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";
import socket from "./WebSocketService";

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);

  const [cursors, setCursors] = useState<{
    [key: string]: { x: number; y: number };
  }>({}); // Store cursor positions

  const [brushColor, setBrushColor] = useState("#000000"); // Default brush color is black
  const [brushSize, setBrushSize] = useState(5);

  const [drawingHistory, setDrawingHistory] = useState<fabric.Path[]>([]);
  const [undoneHistory, setUndoneHistory] = useState<fabric.Path[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    if (canvasRef.current) {
      canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Enable free drawing mode
      if (canvasInstance.current) {
        canvasInstance.current.isDrawingMode = true;
        canvasInstance.current.freeDrawingBrush.width = brushSize;
        canvasInstance.current.freeDrawingBrush.color = brushColor;
      }
    }

    const handleCanvasChange = () => {
      if (canvasInstance.current) {
        const objects = canvasInstance.current.getObjects();
        const paths = objects.filter(
          (obj) => obj instanceof fabric.Path
        ) as fabric.Path[];
        setDrawingHistory(paths);
        setCurrentIndex(paths.length - 1);
      }
    };

    canvasInstance.current?.on("object:added", handleCanvasChange);
    canvasInstance.current?.on("object:removed", handleCanvasChange);

    window.addEventListener("resize", () => {
      if (canvasInstance.current) {
        canvasInstance.current.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        canvasInstance.current.renderAll();
      }
    });

    socket.on("cursorUpdate", (userId: string, x: number, y: number) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [userId]: { x, y },
      }));
    });

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.off("object:added", handleCanvasChange);
        canvasInstance.current.off("object:removed", handleCanvasChange);
        canvasInstance.current.dispose(); // Dispose Fabric.js canvas instance
        canvasInstance.current = null;
        socket.off("cursorUpdate");
      }
      window.removeEventListener("resize", () => {});
    };
  }, [brushColor, brushSize]);

  const undo = () => {
    if (drawingHistory.length > 0) {
      const lastPathIndex = drawingHistory.length - 1;
      const removedPath = drawingHistory[lastPathIndex];
      canvasInstance.current?.remove(removedPath);
      setDrawingHistory((prevHistory) => prevHistory.slice(0, lastPathIndex));
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setUndoneHistory((prevHistory) => [...prevHistory, removedPath]);
    }
  };

  const redo = () => {
    if (undoneHistory.length > 0) {
      const lastUndoneIndex = undoneHistory.length - 1;
      const addedPath = undoneHistory[lastUndoneIndex];
      canvasInstance.current?.add(addedPath);
      setDrawingHistory((prevHistory) => [...prevHistory, addedPath]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setUndoneHistory((prevHistory) => prevHistory.slice(0, lastUndoneIndex));
    }
  };

  useEffect(() => {
    console.log(drawingHistory);
  }, [drawingHistory]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasInstance.current) {
        canvasInstance.current.setWidth(window.innerWidth);
        canvasInstance.current.setHeight(window.innerHeight);
        canvasInstance.current.renderAll();
      }
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const saveAsImage = () => {
    if (canvasInstance.current) {
      const dataURL = canvasInstance.current.toDataURL({
        format: "png",
        quality: 0.8,
      });

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "whiteboard.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const saveAsPDF = () => {
    if (canvasInstance.current) {
      const imgData = canvasInstance.current.toDataURL({
        format: "png",
        quality: 0.8,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [
          canvasInstance.current!.width!,
          canvasInstance.current!.height!,
        ],
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        canvasInstance.current!.width!,
        canvasInstance.current!.height!
      );
      pdf.save("whiteboard.pdf");
    }
  };

  const handleColorChange = (color: string) => {
    setBrushColor(color);
  };

  const handleSizeChange = (size: number) => {
    setBrushSize(size);
  };

  return (
    <div>
      <canvas ref={canvasRef} />
      <input
        type="color"
        value={brushColor}
        onChange={(e) => handleColorChange(e.target.value)}
      />
      <input
        type="range"
        min="1"
        max="20"
        value={brushSize}
        onChange={(e) => handleSizeChange(Number(e.target.value))}
      />
      <button onClick={saveAsImage}>Save as Image</button>
      <button onClick={saveAsPDF}>Save as PDF</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
};

export default Whiteboard;

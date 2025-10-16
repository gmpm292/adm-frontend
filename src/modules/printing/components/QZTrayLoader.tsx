import React, { useEffect, useState } from "react";

export const QZTrayLoader: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "QZ_TRAY_READY") {
        setIsReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div style={{ display: "none" }}>
      <iframe
        src="/qz-tray.html"
        title="QZ Tray Loader"
        onLoad={() => console.log("QZ Tray iframe loaded")}
      />
      {isReady && <div>✅ QZ Tray Listo</div>}
    </div>
  );
};

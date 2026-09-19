import "./controller.css";
import type { Metadata, Viewport } from "next";
import Controller from "./Controller";

// iPhone browsers (Chrome & Safari are both WebKit) can't fullscreen a web page. The one
// iOS path to a chrome-free view is Safari → Share → "Add to Home Screen", which launches
// this standalone when these apple-web-app tags are present.
export const metadata: Metadata = {
  title: "Futbol Island Controller",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FIQ Controller" },
};

// Lock the phone viewport: fill the screen, no pinch-zoom, cover the notch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0e141f",
};

export default function ControllerPage() {
  return <Controller />;
}

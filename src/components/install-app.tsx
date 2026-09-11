import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import {
  WaButton,
  WaCallout,
  WaDetails,
  WaIcon,
} from "@/design-system/font-awsome-web-awesome-171158";

/** Chrome/Edge install prompt event, still non-standard so typed locally. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && !otherBrowser;
}

/**
 * Offers to install the page as a standalone app: a real prompt where the
 * browser supports one, and Safari's manual steps on iPhone and iPad.
 * Renders nothing when it is already installed or cannot be installed.
 */
export function InstallApp(): ReactElement | null {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIosSafari());

    const onPrompt = (event: Event): void => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (promptEvent) {
    const install = (): void => {
      void promptEvent.prompt().finally(() => setPromptEvent(null));
    };
    return (
      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaButton appearance="outlined" onClick={install}>
          <WaIcon slot="start" name="mobile-screen" />
          Install this as an app
        </WaButton>
        <span className="odc-meta">
          Adds an icon to your home screen or desktop and opens without browser tabs.
        </span>
      </div>
    );
  }

  if (!ios) return null;

  return (
    <WaDetails summary="Install this as an app on your iPhone or iPad">
      <WaIcon slot="icon" name="mobile-screen" />
      <WaCallout appearance="plain">
        <p>
          In Safari, tap the Share button, choose <strong>Add to Home Screen</strong>, then tap{" "}
          <strong>Add</strong>. It gets its own icon and opens without browser tabs.
        </p>
        <p className="odc-meta">
          A model you have already downloaded stays available in the installed app, so it still
          works without a connection.
        </p>
      </WaCallout>
    </WaDetails>
  );
}

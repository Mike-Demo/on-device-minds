import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactElement } from "react";

import {
  WaBadge,
  WaButton,
  WaCallout,
  WaCard,
  WaIcon,
  WaOption,
  WaProgressBar,
  WaSelect,
  WaSpinner,
  WaTextarea,
} from "@/design-system/font-awsome-web-awesome-171158";
import { useOnDeviceChat } from "@/hooks/use-on-device-chat";
import { CPU_MODELS, ON_DEVICE_MODELS, findCpuModel, findModel } from "@/lib/webllm/models";

import { DevicePanel } from "./device-panel";

import { EntryGate, GATE_STORAGE_KEY } from "./entry-gate";
import "./on-device-chat.css";

export function OnDeviceChat(): ReactElement {
  const chat = useOnDeviceChat();
  const [gateCleared, setGateCleared] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  

  const { enableWarmStart } = chat;

  useEffect(() => {
    let cleared = false;
    try {
      cleared = window.sessionStorage.getItem(GATE_STORAGE_KEY) === "true";
    } catch {
      cleared = false;
    }
    setGateCleared(cleared);
    setGateChecked(true);
    if (cleared) enableWarmStart();
  }, [enableWarmStart]);

  const clearGate = (): void => {
    try {
      window.sessionStorage.setItem(GATE_STORAGE_KEY, "true");
    } catch {
      /* private mode: the gate simply reappears next visit */
    }
    setGateCleared(true);
    enableWarmStart();
  };
  const selectRef = useRef<HTMLElement | null>(null);
  const cpuSelectRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLElement | null>(null);
  const cpuOnly = chat.runtime === "cpu";
  const gpuModel = findModel(chat.modelId);
  const cpuModel = findCpuModel(chat.cpuModelId);
  const model = cpuOnly ? cpuModel : gpuModel;

  useEffect(() => {
    const element = cpuSelectRef.current;
    if (!element) return;
    const handler = (): void => {
      const value = (element as HTMLElement & { value?: string }).value;
      if (typeof value === "string" && value.length > 0) chat.selectCpuModel(value);
    };
    element.addEventListener("change", handler);
    element.addEventListener("wa-change", handler);
    return () => {
      element.removeEventListener("change", handler);
      element.removeEventListener("wa-change", handler);
    };
  }, [chat]);

  useEffect(() => {
    const element = selectRef.current;
    if (!element) return;
    const handler = (): void => {
      const value = (element as HTMLElement & { value?: string }).value;
      if (typeof value === "string" && value.length > 0) chat.selectModel(value);
    };
    element.addEventListener("change", handler);
    element.addEventListener("wa-change", handler);
    return () => {
      element.removeEventListener("change", handler);
      element.removeEventListener("wa-change", handler);
    };
  }, [chat]);

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const element = textareaRef.current as (HTMLElement & { value?: string }) | null;
    const prompt = (element?.value ?? "").trim();
    if (prompt.length === 0) return;
    if (element) element.value = "";

    void chat.send(prompt);
  };


  if (!gateChecked) {
    return (
      <div className="odc-shell odc-shell-body wa-cluster wa-gap-s wa-align-items-center">
        <WaSpinner />
        <span className="odc-meta">Loading…</span>
      </div>
    );
  }

  if (!gateCleared) {
    return <EntryGate modelId={chat.modelId} onContinue={clearGate} />;
  }

  return (
    <div className="odc-shell odc-shell-body wa-stack wa-gap-2xl">
      {chat.status === "checking" ? (
        <div className="wa-cluster wa-gap-s wa-align-items-center">
          <WaSpinner />
          <span className="odc-meta">Checking what this device can do…</span>
        </div>
      ) : null}

      {chat.status === "unsupported" ? (
        <WaCallout variant="warning" appearance="outlined">
          <WaIcon slot="icon" name="triangle-exclamation" />
          <strong>This device can&apos;t run a model in the browser</strong>
          <p>{chat.device?.reason}</p>
        </WaCallout>
      ) : null}

      {chat.status === "idle" || chat.status === "loading" || chat.status === "error" ? (
        <WaCard appearance="outlined" with-header>
          <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
            <WaIcon name="download" />
            <h2 className="odc-card-heading">
              {cpuOnly ? "Load the processor-only model" : "Choose a model and load it"}
            </h2>
          </div>

          <div className="wa-stack wa-gap-l">
            {cpuOnly ? (
              <>
                <WaCallout variant="warning" appearance="outlined">
                  <WaIcon slot="icon" name="microchip" />
                  <strong>Running on the processor</strong>
                  <p>
                    This browser can&apos;t use the graphics chip, so a small model runs on the
                    processor instead. It works, but answers appear far more slowly — often a few
                    words a second.
                  </p>
                </WaCallout>

                <WaSelect
                  ref={cpuSelectRef}
                  label="Model"
                  value={chat.cpuModelId}
                  hint={`${cpuModel.blurb} About ${cpuModel.approxDownloadMb} MB to download once.`}
                  disabled={chat.status === "loading"}
                  with-label
                  with-hint
                >
                  {CPU_MODELS.map((entry) => (
                    <WaOption key={entry.id} value={entry.id}>
                      {entry.label} — about {entry.approxDownloadMb} MB
                    </WaOption>
                  ))}
                </WaSelect>
              </>
            ) : (
              <WaSelect
                ref={selectRef}
                label="Model"
                value={chat.modelId}
                hint={`${model.blurb} About ${model.approxDownloadMb} MB to download once.`}
                disabled={chat.status === "loading"}
                with-label
                with-hint
              >
                {ON_DEVICE_MODELS.map((entry) => (
                  <WaOption key={entry.id} value={entry.id}>
                    {entry.label}
                  </WaOption>
                ))}
              </WaSelect>
            )}


            {chat.status === "loading" ? (
              <div className="wa-stack wa-gap-xs">
                <WaProgressBar
                  value={Math.round((chat.progress?.fraction ?? 0) * 100)}
                  label="Downloading model"
                />
                <span className="odc-meta">{chat.progress?.text ?? "Preparing…"}</span>
              </div>
            ) : (
              <div className="wa-cluster wa-gap-s wa-align-items-center">
                <WaButton variant="brand" size="l" onClick={() => void chat.loadModel()}>
                  <WaIcon slot="start" name="bolt" />
                  {chat.cached ? "Start (already saved here)" : `Download & start (~${model.approxDownloadMb} MB)`}
                </WaButton>
                <span className="odc-meta">
                  {chat.cached
                    ? "This model is already stored in your browser, so it starts instantly."
                    : "Downloaded once, then kept in this browser for next time."}
                </span>
              </div>
            )}

            {chat.error ? (
              <WaCallout variant="danger" appearance="outlined">
                <WaIcon slot="icon" name="circle-exclamation" />
                {chat.error}
              </WaCallout>
            ) : null}
          </div>
        </WaCard>
      ) : null}

      {chat.status === "ready" ? (
        <WaCard appearance="outlined" with-header with-footer>
          <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
            <WaIcon name="comments" />
            <h2 className="odc-card-heading">{model.label}</h2>
            <WaBadge variant={cpuOnly ? "warning" : "success"} appearance="outlined" pill>
              {cpuOnly ? "Processor only (slower)" : "Graphics accelerated"}
            </WaBadge>
            <WaButton
              appearance="plain"
              size="s"
              onClick={chat.unloadModel}
              disabled={chat.generating}
            >
              <WaIcon slot="start" name="arrows-rotate" />
              Change model
            </WaButton>
          </div>

          <div className="odc-log">
            {chat.turns.length === 0 ? (
              <p className="odc-meta">
                Ask it something short — a summary, a rewrite, a definition. It is a very small model,
                so don&apos;t expect deep reasoning.
              </p>
            ) : null}

            {chat.turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={
                  turn.role === "user"
                    ? "odc-bubble odc-bubble-user"
                    : `odc-bubble odc-bubble-assistant${
                        chat.generating && index === chat.turns.length - 1 ? " odc-caret" : ""
                      }`
                }
              >
                {turn.content}
              </div>
            ))}
          </div>

          <form slot="footer" className="wa-stack wa-gap-s" onSubmit={onSubmit}>
            <WaTextarea
              ref={textareaRef}
              label="Your message"
              placeholder="Summarise this in one sentence…"
              rows={3}
              resize="auto"
              disabled={chat.generating}
              with-label
            />
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <WaButton
                type="submit"
                variant="brand"
                loading={chat.generating}
                disabled={chat.generating}
              >
                <WaIcon slot="start" name="paper-plane" />
                Send
              </WaButton>
              <WaButton appearance="plain" onClick={chat.reset} disabled={chat.generating}>
                Clear
              </WaButton>
            </div>
            {chat.error ? <span className="odc-meta">{chat.error}</span> : null}
          </form>
        </WaCard>
      ) : null}

      <DevicePanel device={chat.device} appleSilicon={chat.appleSilicon} stats={chat.stats} />
    </div>
  );
}

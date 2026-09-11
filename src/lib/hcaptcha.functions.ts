import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({
  token: z.string().trim().min(10).max(10000),
});

/** The public site key, so the browser can render the widget. */
export const getCaptchaSiteKey = createServerFn({ method: "GET" }).handler(async () => {
  const siteKey = process.env["HCAPTCHA_SITE_KEY"] ?? null;
  return { siteKey };
});

/** Verifies an hCaptcha token against hCaptcha's API using the secret key. */
export const verifyCaptcha = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const secret = process.env["HCAPTCHA_SECRET_KEY"];
    if (!secret) {
      return {
        ok: false,
        configured: false,
        error: "The human check is not set up on the server.",
      };
    }

    try {
      const response = await fetch("https://api.hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: data.token }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        "error-codes"?: readonly string[];
      };
      if (result.success === true) {
        return { ok: true, configured: true, error: null };
      }
      const codes = result["error-codes"]?.join(", ");
      return {
        ok: false,
        configured: true,
        error: codes
          ? `The human check was rejected (${codes}). Please try again.`
          : "The human check could not be verified. Please try again.",
      };
    } catch {
      return {
        ok: false,
        configured: true,
        error: "The human check could not be reached. Please try again.",
      };
    }
  });


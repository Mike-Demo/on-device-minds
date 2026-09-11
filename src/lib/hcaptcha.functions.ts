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
      return { ok: false, error: "Captcha is not configured on the server." };
    }

    try {
      const response = await fetch("https://api.hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: data.token }),
      });
      const result = (await response.json()) as { success?: boolean };
      return result.success === true
        ? { ok: true, error: null }
        : { ok: false, error: "The human check could not be verified. Please try again." };
    } catch {
      return { ok: false, error: "The human check could not be reached. Please try again." };
    }
  });

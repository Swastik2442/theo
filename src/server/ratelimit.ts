import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

export const ratelimit = new Ratelimit({
  redis: new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

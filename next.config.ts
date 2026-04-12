import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Не светить стек в заголовке ответа (ZAP: Server Leaks Information via X-Powered-By). */
  poweredByHeader: false,
};

export default nextConfig;

import dns from "node:dns/promises";
import net from "node:net";

export interface FetchedUrlContext {
  url: string;
  title: string;
  excerpt: string;
  error?: string;
}

const MAX_URLS = 2;
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 512 * 1024;
const MAX_EXCERPT_CHARS = 4500;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // Cloud metadata / link-local
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // Multicast / reserved
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (net.isIPv4(mapped)) {
      return isPrivateIpv4(mapped);
    }
  }
  return false;
}

function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip);
  if (net.isIPv6(ip)) return isPrivateIpv6(ip);
  return true;
}

async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("올바른 URL 형식이 아닙니다.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("http 또는 https 주소만 지원합니다.");
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("내부 네트워크 주소는 보안상 조회할 수 없습니다.");
  }

  if (net.isIP(host)) {
    if (isBlockedIp(host)) {
      throw new Error("사설/내부 IP 주소는 보안상 조회할 수 없습니다.");
    }
    return parsed;
  }

  const resolved = await dns.lookup(host, { all: true });
  if (resolved.length === 0) {
    throw new Error("도메인 주소를 찾을 수 없습니다.");
  }
  for (const record of resolved) {
    if (isBlockedIp(record.address)) {
      throw new Error("내부 IP로 연결되는 주소는 보안상 조회할 수 없습니다.");
    }
  }

  return parsed;
}

function extractReadableText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1] : "";
  const title = rawTitle
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: title || "제목 없음",
    text: cleaned.slice(0, MAX_EXCERPT_CHARS),
  };
}

export async function fetchReferenceUrls(
  urls: string[]
): Promise<FetchedUrlContext[]> {
  const uniqueUrls = Array.from(
    new Set(urls.map((u) => u.trim()).filter(Boolean))
  ).slice(0, MAX_URLS);

  const results: FetchedUrlContext[] = [];

  for (const rawUrl of uniqueUrls) {
    try {
      const safeUrl = await assertSafePublicUrl(rawUrl);
      const res = await fetch(safeUrl.toString(), {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "User-Agent":
            "HideawayLabBot/1.0 (+https://hideawaylab.kr) Mozilla/5.0",
          Accept: "text/html,text/plain,application/json;q=0.9,*/*;q=0.5",
        },
      });

      if (!res.ok) {
        results.push({
          url: safeUrl.toString(),
          title: "조회 실패",
          excerpt: "",
          error: `HTTP ${res.status} 응답으로 페이지를 읽지 못했습니다.`,
        });
        continue;
      }

      // Check final redirected URL as well to prevent redirect-based SSRF.
      if (res.url && res.url !== safeUrl.toString()) {
        await assertSafePublicUrl(res.url);
      }

      const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
      if (
        !contentType.includes("text/") &&
        !contentType.includes("json") &&
        !contentType.includes("xml")
      ) {
        results.push({
          url: safeUrl.toString(),
          title: "지원하지 않는 형식",
          excerpt: "",
          error: `웹페이지 텍스트가 아닌 형식(${contentType || "unknown"})입니다.`,
        });
        continue;
      }

      const arrayBuf = await res.arrayBuffer();
      const slice =
        arrayBuf.byteLength > MAX_HTML_BYTES
          ? arrayBuf.slice(0, MAX_HTML_BYTES)
          : arrayBuf;
      const bodyText = new TextDecoder("utf-8", { fatal: false }).decode(slice);

      if (contentType.includes("html")) {
        const { title, text } = extractReadableText(bodyText);
        results.push({
          url: safeUrl.toString(),
          title,
          excerpt: text || "(본문 텍스트가 비어 있습니다.)",
        });
      } else {
        results.push({
          url: safeUrl.toString(),
          title: safeUrl.hostname,
          excerpt: bodyText.slice(0, MAX_EXCERPT_CHARS),
        });
      }
    } catch (error) {
      results.push({
        url: rawUrl,
        title: "조회 오류",
        excerpt: "",
        error:
          error instanceof Error
            ? error.message
            : "URL을 읽는 중 오류가 발생했습니다.",
      });
    }
  }

  return results;
}

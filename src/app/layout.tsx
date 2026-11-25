import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.brand.url),
  title: {
    default: `${siteConfig.brand.nameKo} | ${siteConfig.brand.nameEn}`,
    template: `%s | ${siteConfig.brand.nameEn}`,
  },
  description:
    "하이드어웨이 랩(Hideaway Lab)은 AI 멀티 에이전트 협업 시스템과 실용적인 소프트웨어를 만드는 독립 AI 제품 스튜디오입니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.brand.url,
    siteName: siteConfig.brand.nameEn,
    title: `${siteConfig.brand.nameKo} | ${siteConfig.brand.nameEn}`,
    description: siteConfig.brand.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-[#090a0c] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}

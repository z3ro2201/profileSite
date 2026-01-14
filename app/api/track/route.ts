import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { config } from "@/lib/analytics-config";
import type { VisitorData, GeoLocation } from "@/types/Analytics";

export const POST = async (request: NextRequest) => {
  try {
    if (!config.enableTracking) {
      return NextResponse.json({ success: false, message: "Tracking disabled" }, { status: 200 });
    }

    const body: VisitorData = await request.json();
    const { visitor_id, session_id, page_path, referrer, user_agent, device_type, browser, os, screen_resolution, language } = body;

    // IP 주소 가져오기 (프록시 환경 고려)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";

    // IP 기반 위치 정보
    let country: string | null = null;
    let city: string | null = null;

    // 배포 환경에서만 위치 정보 조회
    if (config.enableGeoLocation && ip !== "unknown" && !ip.startsWith("127.") && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
          signal: AbortSignal.timeout(config.geoApiTimeout),
        });
        const geoData: GeoLocation = await geoResponse.json();
        if (geoData.status === "success") {
          country = geoData.country || null;
          city = geoData.city || null;
        }
      } catch (error) {
        if (config.logErrors) {
          console.error("Geo location error:", error);
        }
      }
    }

    // Prisma로 데이터 저장
    await prisma.pageVisit.create({
      data: {
        visitorId: visitor_id,
        sessionId: session_id,
        pagePath: page_path,
        referrer: referrer,
        userAgent: user_agent,
        ipAddress: ip,
        country: country,
        city: city,
        deviceType: device_type,
        browser: browser,
        os: os,
        screenResolution: screen_resolution,
        language: language,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (config.logErrors) {
      console.error("Tracking error:", error);
    }
    // 에러가 나도 200 반환 (클라이언트에 영향 없음)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 200 });
  }
};

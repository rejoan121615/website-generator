import { NextRequest, NextResponse } from "next/server";
import { ConnectDomain, ConnectDomainResTYPE } from "@repo/cf";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ConnectDomainResTYPE>> {
  try {
    const { domain }: { domain: string } = await request.json();

    if (!domain) {
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "Please send domain name from post request",
      });
    }

    const res = await ConnectDomain({ domainName: domain });

    console.log('connect domain response on route ')
    console.log('--------------------------------------------------------------------------')
    console.log(res);

    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: "Fallback response from api",
    });
  } catch (error) {
    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: "Fallback response from api",
    });
  }
}

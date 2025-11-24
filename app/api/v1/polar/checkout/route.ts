import GetUserSession from "@/app/actions/user/getUserSession";
import { polar } from "@/lib/polar";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await GetUserSession();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { productId, planName } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "product id not provided" },
        { status: 403 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) return;

    let polarCustomerId = dbUser?.stripeCustomerId;

    if (!polarCustomerId) {
      const customer = await polar.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: dbUser.id,
        },
      });

      polarCustomerId = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: polarCustomerId,
        },
      });
    }

    const checkoutSession = await polar.checkouts.create({
      customerId: polarCustomerId,
      products: [productId],
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/home?success=true`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: dbUser.id,
      },
    });

    console.log("checkout url:::", checkoutSession.url);

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("polar checkout error: ", error);
    return NextResponse.json(
      { error: "failed to create checkout sessionk" },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { Webhooks } from "@polar-sh/nextjs";
import { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";
import { WebhookSubscriptionCanceledPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js";
import { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload.js";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (payload) => handleSubsciptionCreated(payload),
  onSubscriptionUpdated: async (payload) => handleSubscriptionUpdated(payload),
  onSubscriptionCanceled: async (payload) =>
    handleSubscriptionCanceled(payload),
  onOrderPaid: async (payload) => handlePaymentSucceded(payload),
});

async function handleSubsciptionCreated(
  subscription: WebhookSubscriptionCreatedPayload
) {
  try {
    const customerId = subscription.data.customer;
    const planName = getPlanFromSubscription(subscription.data);

    console.log("customer id polar::", subscription.data.customerId);

    const user = await prisma.user.findFirst({
      where: {
        stripeCustomerId: customerId.id,
      },
    });

    console.log("customer id db::", user?.stripeCustomerId);

    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          currentPlan: planName,
          subscriptionStatus: "active",
          stripeSubscriptionId: subscription.data.id,
          billingPeriodStart: new Date(),
          meetingsThisMonth: 0,
          chatMessagesToday: 0,
        },
      });
    }
  } catch (error) {
    console.error("error handling subscription create::", error);
  }
}

async function handleSubscriptionUpdated(
  subscription: WebhookSubscriptionUpdatedPayload
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        stripeSubscriptionId: subscription.data.id,
      },
    });

    if (user) {
      const planName = getPlanFromSubscription(subscription.data);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          currentPlan: planName,
          subscriptionStatus:
            subscription.data.status === "active" ? "active" : "canceled",
        },
      });
    }
  } catch (error) {
    console.error("error handling subscription update: ", error);
  }
}

async function handleSubscriptionCanceled(
  subscription: WebhookSubscriptionCanceledPayload
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        stripeSubscriptionId: subscription.data.id,
      },
    });

    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          subscriptionStatus: "canceled",
        },
      });
    }
  } catch (error) {
    console.error("error handling subscription cancelation: ", error);
  }
}

export async function handlePaymentSucceded(invoice: WebhookOrderPaidPayload) {
  try {
    const subscriptionId = invoice.data.id;

    if (subscriptionId) {
      const user = await prisma.user.findFirst({
        where: {
          stripeSubscriptionId: subscriptionId,
        },
      });

      if (user) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            subscriptionStatus: "active",
            billingPeriodStart: new Date(),
            meetingsThisMonth: 0,
          },
        });
      }
    }
  } catch (error) {
    console.error("handle payment succeded error: ", error);
  }
}

function getPlanFromSubscription(subscription: Subscription) {
  const productId = subscription.productId;

  const productToPlan: Record<string, string> = {
    "bb18090e-358c-49dc-ab2e-bd7a29867fb8": "starter",
    "aa789754-af52-45c6-b8e2-845b93389f7a": "pro",
    "bb94f20d-15b3-49b5-ac17-df84118441c0": "premium",
  };

  return productToPlan[productId] || "invalid";
}

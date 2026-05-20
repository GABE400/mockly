"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function completeOnboarding(answers: Record<string, any>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Sync existing answers if present
  let existingAnswers: Record<string, any> = {};
  if (session.user.onboardingAnswers) {
    try {
      existingAnswers = typeof session.user.onboardingAnswers === "string"
        ? JSON.parse(session.user.onboardingAnswers)
        : (session.user.onboardingAnswers as Record<string, any>);
    } catch (e) {
      existingAnswers = {};
    }
  }

  const mergedAnswers = {
    ...existingAnswers,
    ...answers,
  };

  // Save to database
  await db
    .update(user)
    .set({
      onboardingAnswers: mergedAnswers,
      onboardingComplete: true,
    })
    .where(eq(user.id, userId));

  return { success: true };
}

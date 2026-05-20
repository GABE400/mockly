import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password - Muckly",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f3f4f6; border-radius: 8px;">
            <h2 style="color: #6366f1;">Reset your password</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <a href="${url}" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request this, you can ignore this email.</p>
            <hr style="border-color: #1f2937;" />
            <p style="font-size: 12px; color: #9ca3af;">Muckly Support</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Muckly",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f3f4f6; border-radius: 8px;">
            <h2 style="color: #6366f1;">Verify your email address</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for signing up for Muckly! Please click the button below to verify your email address and get started:</p>
            <a href="${url}" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>If you didn't sign up for an account, you can ignore this email.</p>
            <hr style="border-color: #1f2937;" />
            <p style="font-size: 12px; color: #9ca3af;">Muckly Support</p>
          </div>
        `,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Protect field from manual manipulation on signup
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      onboardingComplete: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      onboardingAnswers: {
        type: "string", // Stores onboarding answers JSON (cast as needed)
        required: false,
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});

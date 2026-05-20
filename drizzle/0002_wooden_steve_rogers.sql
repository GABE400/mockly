ALTER TABLE "user" ADD COLUMN "onboarding_answers" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;
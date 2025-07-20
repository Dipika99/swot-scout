ALTER TABLE "insight" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "insight" DROP COLUMN "overall_confidence";--> statement-breakpoint
ALTER TABLE "insight" DROP COLUMN "word_confidences";
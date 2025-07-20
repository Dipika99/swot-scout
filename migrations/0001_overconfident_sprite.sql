CREATE TABLE "comparison" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"report_ids" json NOT NULL,
	"comparison_type" text NOT NULL,
	"metadata" json,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insight" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"category" text NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"overall_confidence" numeric(3, 2) NOT NULL,
	"word_confidences" json,
	"model_version" text NOT NULL,
	"processing_time" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"product" text NOT NULL,
	"objective" text NOT NULL,
	"segment" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" json,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insight" ADD CONSTRAINT "insight_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE no action ON UPDATE no action;
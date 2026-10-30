CREATE TABLE "customer_rule_template_detail" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"rule_type" text DEFAULT 'BookingRestriction' NOT NULL,
	"condition_key" text NOT NULL,
	"condition_operator" text DEFAULT 'eq' NOT NULL,
	"condition_value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_rule_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"rule_type" text DEFAULT 'BookingRestriction' NOT NULL,
	"condition_key" text NOT NULL,
	"condition_operator" text DEFAULT 'eq' NOT NULL,
	"condition_value" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_pic" ADD COLUMN "mobile_phone_no" text;--> statement-breakpoint
ALTER TABLE "customer_pic" ADD COLUMN "dob" date;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "allow_credit_over_use" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "max_credit_over_use_amount" numeric(14, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "credit_over_use_valid_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer_rule_template_detail" ADD CONSTRAINT "customer_rule_template_detail_template_id_customer_rule_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."customer_rule_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_rule" ADD CONSTRAINT "customer_rule_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;
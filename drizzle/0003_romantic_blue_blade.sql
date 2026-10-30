CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"meta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_menu_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"menu_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permission_override" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"permission_code" text NOT NULL,
	"effect" text DEFAULT 'allow' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_menu_permission" ADD CONSTRAINT "role_menu_permission_role_id_admin_user_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_user_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_menu_permission" ADD CONSTRAINT "role_menu_permission_menu_id_app_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."app_menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permission_override" ADD CONSTRAINT "user_permission_override_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permission_override" ADD CONSTRAINT "user_permission_override_permission_code_list_of_user_permission_code_fk" FOREIGN KEY ("permission_code") REFERENCES "public"."list_of_user_permission"("code") ON DELETE cascade ON UPDATE no action;
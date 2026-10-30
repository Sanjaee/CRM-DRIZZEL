CREATE TABLE "admin_user_department" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"parent_department_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_user_department_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_user_role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"security_level" text DEFAULT 'Low',
	"scope_type" text DEFAULT 'Department',
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_user_role_role_unique" UNIQUE("role")
);
--> statement-breakpoint
CREATE TABLE "airline" (
	"id" text PRIMARY KEY NOT NULL,
	"airline_code" text NOT NULL,
	"airline_group_code" text,
	"airline_name" text NOT NULL,
	"alias" text,
	"logo_path" text,
	"company_name" text,
	"aircraft" text,
	"office_address" text,
	"email_address" text,
	"phone_no" text,
	"official_web" text,
	"country" text DEFAULT 'ID',
	"request_passenger_identity_no" boolean DEFAULT true,
	"show_on_airline_section" boolean DEFAULT true,
	CONSTRAINT "airline_airline_code_unique" UNIQUE("airline_code")
);
--> statement-breakpoint
CREATE TABLE "airport" (
	"id" text PRIMARY KEY NOT NULL,
	"airport_code" text NOT NULL,
	"airport_name" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"icao" text,
	"latitude" text,
	"longitude" text,
	"time_zone" text,
	"show_on_search_airport" boolean DEFAULT true,
	CONSTRAINT "airport_airport_code_unique" UNIQUE("airport_code")
);
--> statement-breakpoint
CREATE TABLE "app_menu" (
	"id" text PRIMARY KEY NOT NULL,
	"group_title" text NOT NULL,
	"group_icon" text DEFAULT 'Folder' NOT NULL,
	"title" text NOT NULL,
	"url" text DEFAULT '#' NOT NULL,
	"icon" text,
	"order" integer DEFAULT 0 NOT NULL,
	"roles" text DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_setting" (
	"id" text PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"name" text NOT NULL,
	"data_type" text DEFAULT 'String',
	"default_value" text,
	"description" text,
	CONSTRAINT "app_setting_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "billing_detail" (
	"id" text PRIMARY KEY NOT NULL,
	"billing_id" text NOT NULL,
	"item_code" text,
	"item_name" text NOT NULL,
	"qty" integer DEFAULT 1,
	"unit_price" numeric(14, 2) NOT NULL,
	"total_price" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_type" text NOT NULL,
	"booking_id" text NOT NULL,
	"billing_no" text NOT NULL,
	"order_no" text,
	"base_price" numeric(14, 2) DEFAULT '0',
	"tax" numeric(14, 2) DEFAULT '0',
	"discount" numeric(14, 2) DEFAULT '0',
	"bill_amount" numeric(14, 2) NOT NULL,
	"paid_amount" numeric(14, 2) DEFAULT '0',
	"expired_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"payment_channel" text,
	"billing_status" text DEFAULT 'Pending',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "billing_billing_no_unique" UNIQUE("billing_no")
);
--> statement-breakpoint
CREATE TABLE "blog_article" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_title" text,
	"content" text NOT NULL,
	"lang_code" text DEFAULT 'id',
	"category" text DEFAULT 'Travel',
	"tags" text,
	"show_in_home_page" boolean DEFAULT false,
	"read_time" integer DEFAULT 3,
	"is_archived" boolean DEFAULT false,
	"banner_file_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_type" text NOT NULL,
	"booking_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email_address" text NOT NULL,
	"phone_number" text NOT NULL,
	"country_code" text DEFAULT 'ID'
);
--> statement-breakpoint
CREATE TABLE "booking_customer_cancellation_request" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_type" text NOT NULL,
	"booking_id" text NOT NULL,
	"reason" text NOT NULL,
	"refund_status" text DEFAULT 'Pending',
	"refund_amount" numeric(14, 2),
	"admin_notes" text,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_flight_detail" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_flight_id" text NOT NULL,
	"sequence_number" integer DEFAULT 1,
	"airline_code" text NOT NULL,
	"airline_name" text,
	"flight_number" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"depart_date" timestamp with time zone NOT NULL,
	"arrive_date" timestamp with time zone NOT NULL,
	"flight_duration" integer,
	"cabin_class" text
);
--> statement-breakpoint
CREATE TABLE "booking_flight_pax" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_flight_id" text NOT NULL,
	"prefix" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"gender" text,
	"traveler_type" text DEFAULT 'Adult',
	"date_of_birth" date,
	"identity_no" text,
	"passport_no" text,
	"nationality" text DEFAULT 'ID',
	"user_passenger_id" text
);
--> statement-breakpoint
CREATE TABLE "booking_flight" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_code" text NOT NULL,
	"booking_code" text,
	"booked_by" text,
	"email_alert" text,
	"contact_no" text,
	"itinerary" text,
	"route_type" text DEFAULT 'OneWay',
	"cabin_class" text DEFAULT 'Economy',
	"flight_type" text DEFAULT 'Domestic',
	"total_adult" integer DEFAULT 1,
	"total_child" integer DEFAULT 0,
	"total_infant" integer DEFAULT 0,
	"base_fare" numeric(14, 2) DEFAULT '0',
	"tax" numeric(14, 2) DEFAULT '0',
	"bill_amount" numeric(14, 2) DEFAULT '0',
	"vendor_reservation_id" text,
	"vendor_pnr" text,
	"status" text DEFAULT 'Booked',
	"issued" boolean DEFAULT false,
	"issued_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "booking_flight_reservation_code_unique" UNIQUE("reservation_code")
);
--> statement-breakpoint
CREATE TABLE "booking_hotel_room" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_hotel_id" text NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"qty" integer DEFAULT 1,
	"bed_type" text,
	"include_breakfast" boolean DEFAULT false,
	"price_per_night" numeric(14, 2)
);
--> statement-breakpoint
CREATE TABLE "booking_hotel" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_code" text NOT NULL,
	"booked_by" text,
	"hotel_name" text NOT NULL,
	"city" text NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"total_rooms" integer DEFAULT 1,
	"total_adult" integer DEFAULT 1,
	"total_child" integer DEFAULT 0,
	"base_fare" numeric(14, 2) DEFAULT '0',
	"tax" numeric(14, 2) DEFAULT '0',
	"bill_amount" numeric(14, 2) DEFAULT '0',
	"status" text DEFAULT 'Booked',
	"issued" boolean DEFAULT false,
	"issued_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "booking_hotel_reservation_code_unique" UNIQUE("reservation_code")
);
--> statement-breakpoint
CREATE TABLE "booking_log" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_type" text NOT NULL,
	"booking_id" text NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"remarks" text,
	"previous_status" text,
	"new_status" text,
	"logged_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_agreement_doc" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"document_no" text NOT NULL,
	"title" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"file_id" text,
	"file_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_credit_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"movement_type" text NOT NULL,
	"movement_status" text DEFAULT 'Settled',
	"balance_before" numeric(14, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"reference_doc" text,
	"notes" text,
	"movement_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_deposit_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"movement_type" text NOT NULL,
	"movement_status" text DEFAULT 'Settled',
	"balance_before" numeric(14, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"reference_doc" text,
	"notes" text,
	"movement_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"customer_type" text DEFAULT 'Corporate',
	"business_type" text,
	"default_credit_limit" numeric(14, 2) DEFAULT '0',
	"max_credit_limit" numeric(14, 2) DEFAULT '0',
	"due_days" integer DEFAULT 30,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_label_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"label_id" text NOT NULL,
	"created_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"email_address" text,
	"phone_no" text,
	"position" text,
	"division" text,
	"is_active" boolean DEFAULT true,
	"is_head_officer" boolean DEFAULT false,
	"user_no" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_refund_account" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"bank_name" text NOT NULL,
	"bank_branch" text,
	"account_no" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"is_primary" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_no" text NOT NULL,
	"name" text NOT NULL,
	"alias" text,
	"customer_group_id" text,
	"customer_type" text DEFAULT 'Corporate',
	"business_type" text,
	"business_nature" text,
	"logo_url" text,
	"office_address" text,
	"office_address_city" text,
	"office_address_country" text,
	"email_address" text,
	"phone_no" text,
	"currency_code" text DEFAULT 'IDR',
	"due_days" integer DEFAULT 30,
	"grace_period" integer DEFAULT 7,
	"tax_id_type" text,
	"tax_id_no" text,
	"tax_payer_name" text,
	"credit_limit" numeric(14, 2) DEFAULT '0',
	"credit_on_hold" numeric(14, 2) DEFAULT '0',
	"credit_in_used" numeric(14, 2) DEFAULT '0',
	"credit_available" numeric(14, 2) DEFAULT '0',
	"deposit_balance" numeric(14, 2) DEFAULT '0',
	"deposit_on_hold" numeric(14, 2) DEFAULT '0',
	"deposit_available" numeric(14, 2) DEFAULT '0',
	"status" text DEFAULT 'Active',
	"enable_rule" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "customer_customer_no_unique" UNIQUE("customer_no")
);
--> statement-breakpoint
CREATE TABLE "doc_approval_request" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_rule_id" text,
	"document_type" text NOT NULL,
	"document_id" text NOT NULL,
	"requester_user_id" text NOT NULL,
	"requester_department" text,
	"current_step_order" integer DEFAULT 1,
	"status" text DEFAULT 'Pending',
	"amount" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doc_approval_workflow_log" (
	"id" text PRIMARY KEY NOT NULL,
	"approval_request_id" text NOT NULL,
	"step_order" integer NOT NULL,
	"action_by_user_id" text NOT NULL,
	"action_by_department" text,
	"status" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doc_number_template" (
	"id" text PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"prefix" text,
	"suffix" text,
	"last_used" timestamp with time zone,
	"start_from" integer DEFAULT 1,
	"next_number" integer DEFAULT 1,
	"reset_frequency" text DEFAULT 'Monthly',
	"description" text,
	CONSTRAINT "doc_number_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "file_entity" (
	"id" text PRIMARY KEY NOT NULL,
	"general_id" text,
	"group_name" text,
	"category" text,
	"content_type" text,
	"file_name" text NOT NULL,
	"file_size" numeric(14, 2),
	"file_ext" text,
	"absolute_url" text NOT NULL,
	"storage_provider" text DEFAULT 'AwsS3',
	"aws_bucket_name" text,
	"full_path" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flight_reservation" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_no" text NOT NULL,
	"invoice_id" text,
	"customer_id" text NOT NULL,
	"pnr_code" text NOT NULL,
	"route_type" text DEFAULT 'Domestic',
	"flight_type" text DEFAULT 'OneWay',
	"flight_class" text DEFAULT 'Economy',
	"adult" integer DEFAULT 1,
	"child" integer DEFAULT 0,
	"infant" integer DEFAULT 0,
	"status" text DEFAULT 'Active',
	"net_fare" numeric(14, 2) DEFAULT '0',
	"service_fee" numeric(14, 2) DEFAULT '0',
	"discount" numeric(14, 2) DEFAULT '0',
	"sub_total" numeric(14, 2) NOT NULL,
	"description" text,
	CONSTRAINT "flight_reservation_reservation_no_unique" UNIQUE("reservation_no")
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"service_type" text NOT NULL,
	"end_point" text NOT NULL,
	"log_activity" boolean DEFAULT true,
	"is_enabled" boolean DEFAULT true,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "invoice_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"paid_amount" numeric(14, 2) NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now(),
	"allocation_note" text
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_no" text NOT NULL,
	"customer_no" text NOT NULL,
	"customer_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"product_group" text DEFAULT 'Flight',
	"product_code" text,
	"due_days" integer DEFAULT 30,
	"due_date" date NOT NULL,
	"currency_code" text DEFAULT 'IDR',
	"net_fare" numeric(14, 2) DEFAULT '0',
	"service_fee" numeric(14, 2) DEFAULT '0',
	"discount" numeric(14, 2) DEFAULT '0',
	"gst" numeric(14, 2) DEFAULT '0',
	"billing_amount" numeric(14, 2) NOT NULL,
	"billing_status" text DEFAULT 'Unpaid',
	"paid_amount" numeric(14, 2) DEFAULT '0',
	"remaining_amount" numeric(14, 2) DEFAULT '0',
	"invoice_type" text DEFAULT 'Regular',
	"invoice_status" text DEFAULT 'Draft',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "invoice_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
CREATE TABLE "list_of_customer_label" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3b82f6',
	"is_public" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "list_of_user_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"module" text,
	CONSTRAINT "list_of_user_permission_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notification_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"group_name" text DEFAULT 'System',
	"lang_code" text DEFAULT 'id',
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"notification_type" text DEFAULT 'Email',
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "notification_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payment_gateway_payment_method" (
	"id" text PRIMARY KEY NOT NULL,
	"method_code" text NOT NULL,
	"method_name" text NOT NULL,
	"method_group" text NOT NULL,
	"merchant_code" text,
	"fee_in_percentage" numeric(5, 2) DEFAULT '0',
	"min_fee_amount" numeric(14, 2) DEFAULT '0',
	"image_path" text,
	"is_default" boolean DEFAULT false,
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "payment_gateway_payment_method_method_code_unique" UNIQUE("method_code")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_no" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now(),
	"received_accnt" text NOT NULL,
	"currency_code" text DEFAULT 'IDR',
	"received_amt" numeric(14, 2) NOT NULL,
	"allocated" numeric(14, 2) DEFAULT '0',
	"unallocated" numeric(14, 2) NOT NULL,
	"allocation_status" text DEFAULT 'Unallocated',
	CONSTRAINT "payment_payment_no_unique" UNIQUE("payment_no")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"product_code" text NOT NULL,
	"product_type" text NOT NULL,
	"name" text NOT NULL,
	"opt_string_1" text,
	"opt_string_2" text,
	"opt_string_3" text,
	"opt_int_1" integer,
	"opt_int_2" integer,
	"opt_int_3" integer,
	"booking_deposit_percent" numeric(5, 2),
	"booking_deposit_amount" numeric(14, 2),
	"booking_notes" text,
	"tags" text,
	"vendor_id" text,
	"disable_booking" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"display_seq" integer DEFAULT 0,
	"thumbnail_file_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE "promotion" (
	"id" text PRIMARY KEY NOT NULL,
	"promo_name" text NOT NULL,
	"promo_code" text NOT NULL,
	"promotion_type" text DEFAULT 'DiscountPrice',
	"discount_amount" numeric(14, 2),
	"discount_percentage" numeric(5, 2),
	"effective_date_from" timestamp with time zone NOT NULL,
	"effective_date_to" timestamp with time zone NOT NULL,
	"total_available" integer,
	"number_of_use" integer DEFAULT 0,
	"is_enabled" boolean DEFAULT true,
	"description" text,
	"tags" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "promotion_promo_code_unique" UNIQUE("promo_code")
);
--> statement-breakpoint
CREATE TABLE "static_content" (
	"id" text PRIMARY KEY NOT NULL,
	"page_code" text NOT NULL,
	"page_title" text NOT NULL,
	"content_html" text NOT NULL,
	"lang_code" text DEFAULT 'id',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "static_content_page_code_unique" UNIQUE("page_code")
);
--> statement-breakpoint
CREATE TABLE "subscriber" (
	"id" text PRIMARY KEY NOT NULL,
	"email_address" text NOT NULL,
	"is_subscribed" boolean DEFAULT true,
	"subscribed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscriber_email_address_unique" UNIQUE("email_address")
);
--> statement-breakpoint
CREATE TABLE "tour_date" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date,
	"price_adult" numeric(14, 2) NOT NULL,
	"price_child" numeric(14, 2),
	"quota" integer DEFAULT 20,
	"booked_count" integer DEFAULT 0,
	"is_available" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "user_device" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text,
	"platform" text,
	"push_token" text,
	"is_active" boolean DEFAULT true,
	"registered_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message_no" text,
	"header" text NOT NULL,
	"message" text NOT NULL,
	"action_type" text,
	"target_type" text,
	"target_id" text,
	"target_action" text,
	"navigation_payload_json" text,
	"is_read" boolean DEFAULT false,
	"read_date" timestamp with time zone,
	"created_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_passenger" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prefix" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"full_name" text,
	"gender" text,
	"traveler_type" text DEFAULT 'Adult',
	"identity_no" text,
	"passport_no" text,
	"passport_expiry" date,
	"nationality" text DEFAULT 'ID',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_point_balance_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"movement_type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance" numeric(14, 2) NOT NULL,
	"date" timestamp with time zone DEFAULT now(),
	"promotion_id" text,
	"billing_id" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "visitor" (
	"id" text PRIMARY KEY NOT NULL,
	"logged_as_user_id" text,
	"ipv4" text,
	"country_code" text,
	"country_name" text,
	"city" text,
	"device_type" text,
	"device_os" text,
	"entry_point" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_action" (
	"id" text PRIMARY KEY NOT NULL,
	"module_code" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "workflow_action_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "workflow_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_action_id" text NOT NULL,
	"department_code" text,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "workflow_step" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_rule_id" text NOT NULL,
	"step_order" integer NOT NULL,
	"required_role" text NOT NULL,
	"department_scope" text DEFAULT 'Any',
	"min_amount" numeric(14, 2),
	"max_amount" numeric(14, 2)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_no" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "prefix" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_user_department" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_user_role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "middle_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "login_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "business_partner_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_no_1" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_no_2" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_points" numeric(14, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "points_on_hold" numeric(14, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_phone_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sign_up_provider" text DEFAULT 'Google';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_logged_in" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_log_in" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_log_out" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lang_code" text DEFAULT 'id';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country_code" text DEFAULT 'ID';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_admin_user" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "join_date" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "admin_user_role_permission" ADD CONSTRAINT "admin_user_role_permission_role_id_admin_user_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_user_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_role_permission" ADD CONSTRAINT "admin_user_role_permission_permission_code_list_of_user_permission_code_fk" FOREIGN KEY ("permission_code") REFERENCES "public"."list_of_user_permission"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_detail" ADD CONSTRAINT "billing_detail_billing_id_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "public"."billing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_customer_cancellation_request" ADD CONSTRAINT "booking_customer_cancellation_request_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flight_detail" ADD CONSTRAINT "booking_flight_detail_booking_flight_id_booking_flight_id_fk" FOREIGN KEY ("booking_flight_id") REFERENCES "public"."booking_flight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flight_pax" ADD CONSTRAINT "booking_flight_pax_booking_flight_id_booking_flight_id_fk" FOREIGN KEY ("booking_flight_id") REFERENCES "public"."booking_flight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flight_pax" ADD CONSTRAINT "booking_flight_pax_user_passenger_id_user_passenger_id_fk" FOREIGN KEY ("user_passenger_id") REFERENCES "public"."user_passenger"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flight" ADD CONSTRAINT "booking_flight_booked_by_user_id_fk" FOREIGN KEY ("booked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_hotel_room" ADD CONSTRAINT "booking_hotel_room_booking_hotel_id_booking_hotel_id_fk" FOREIGN KEY ("booking_hotel_id") REFERENCES "public"."booking_hotel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_hotel" ADD CONSTRAINT "booking_hotel_booked_by_user_id_fk" FOREIGN KEY ("booked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_agreement_doc" ADD CONSTRAINT "customer_agreement_doc_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credit_movement" ADD CONSTRAINT "customer_credit_movement_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_deposit_movement" ADD CONSTRAINT "customer_deposit_movement_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_label_assignment" ADD CONSTRAINT "customer_label_assignment_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_label_assignment" ADD CONSTRAINT "customer_label_assignment_label_id_list_of_customer_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."list_of_customer_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_pic" ADD CONSTRAINT "customer_pic_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_refund_account" ADD CONSTRAINT "customer_refund_account_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_customer_group_id_customer_group_id_fk" FOREIGN KEY ("customer_group_id") REFERENCES "public"."customer_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_approval_request" ADD CONSTRAINT "doc_approval_request_workflow_rule_id_workflow_rule_id_fk" FOREIGN KEY ("workflow_rule_id") REFERENCES "public"."workflow_rule"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_approval_workflow_log" ADD CONSTRAINT "doc_approval_workflow_log_approval_request_id_doc_approval_request_id_fk" FOREIGN KEY ("approval_request_id") REFERENCES "public"."doc_approval_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_reservation" ADD CONSTRAINT "flight_reservation_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_reservation" ADD CONSTRAINT "flight_reservation_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment" ADD CONSTRAINT "invoice_payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment" ADD CONSTRAINT "invoice_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_date" ADD CONSTRAINT "tour_date_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_device" ADD CONSTRAINT "user_device_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification" ADD CONSTRAINT "user_notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_passenger" ADD CONSTRAINT "user_passenger_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_point_balance_movement" ADD CONSTRAINT "user_point_balance_movement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor" ADD CONSTRAINT "visitor_logged_as_user_id_user_id_fk" FOREIGN KEY ("logged_as_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rule" ADD CONSTRAINT "workflow_rule_workflow_action_id_workflow_action_id_fk" FOREIGN KEY ("workflow_action_id") REFERENCES "public"."workflow_action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_step" ADD CONSTRAINT "workflow_step_workflow_rule_id_workflow_rule_id_fk" FOREIGN KEY ("workflow_rule_id") REFERENCES "public"."workflow_rule"("id") ON DELETE cascade ON UPDATE no action;
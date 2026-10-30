import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ===========================================================================
// 1. NextAuth & User Management
// ===========================================================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // NextAuth / Google standard fields
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
  role: text("role").notNull().default("user"),

  // Wahana APP_USER profile extensions
  userNo: text("user_no"),
  prefix: text("prefix"), // Mr / Mrs / Ms / Dr
  adminUserDepartment: text("admin_user_department"),
  adminUserRole: text("admin_user_role"),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  displayName: text("display_name"),
  loginId: text("login_id"),
  businessPartnerId: text("business_partner_id"),
  phoneNo1: text("phone_no_1"),
  phoneNo2: text("phone_no_2"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"), // Male / Female
  totalPoints: numeric("total_points", { precision: 14, scale: 2 }).default("0"),
  pointsOnHold: numeric("points_on_hold", { precision: 14, scale: 2 }).default("0"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  signUpProvider: text("sign_up_provider").default("Google"),
  isEnabled: boolean("is_enabled").default(true),
  isLoggedIn: boolean("is_logged_in").default(false),
  lastLogIn: timestamp("last_log_in", { mode: "date", withTimezone: true }),
  lastLogOut: timestamp("last_log_out", { mode: "date", withTimezone: true }),
  langCode: text("lang_code").default("id"),
  countryCode: text("country_code").default("ID"),
  isAdminUser: boolean("is_admin_user").default(false),
  joinDate: timestamp("join_date", { mode: "date", withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
  ],
);

export const adminUserRoles = pgTable("admin_user_role", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull().unique(),
  securityLevel: text("security_level").default("Low"), // Low / Medium / High / Critical
  scopeType: text("scope_type").default("Department"), // Department / Organization / Global
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const adminUserDepartments = pgTable("admin_user_department", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  parentDepartmentId: text("parent_department_id"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const listOfUserPermissions = pgTable("list_of_user_permission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  module: text("module"),
});

export const adminUserRolePermissions = pgTable("admin_user_role_permission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roleId: text("role_id")
    .notNull()
    .references(() => adminUserRoles.id, { onDelete: "cascade" }),
  permissionCode: text("permission_code")
    .notNull()
    .references(() => listOfUserPermissions.code, { onDelete: "cascade" }),
});

export const userPassengers = pgTable("user_passenger", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  prefix: text("prefix"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  fullName: text("full_name"),
  gender: text("gender"),
  travelerType: text("traveler_type").default("Adult"), // Adult / Child / Infant
  identityNo: text("identity_no"),
  passportNo: text("passport_no"),
  passportExpiry: date("passport_expiry"),
  nationality: text("nationality").default("ID"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const userPointBalanceMovements = pgTable("user_point_balance_movement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movementType: text("movement_type").notNull(), // Earned / Redeemed / Expired / Adjusted
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull(),
  date: timestamp("date", { mode: "date", withTimezone: true }).defaultNow(),
  promotionId: text("promotion_id"),
  billingId: text("billing_id"),
  description: text("description"),
});

export const userNotifications = pgTable("user_notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageNo: text("message_no"),
  header: text("header").notNull(),
  message: text("message").notNull(),
  actionType: text("action_type"),
  targetType: text("target_type"),
  targetId: text("target_id"),
  targetAction: text("target_action"),
  navigationPayloadJson: text("navigation_payload_json"),
  isRead: boolean("is_read").default(false),
  readDate: timestamp("read_date", { mode: "date", withTimezone: true }),
  createdDate: timestamp("created_date", { mode: "date", withTimezone: true }).defaultNow(),
});

export const userDevices = pgTable("user_device", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(),
  deviceName: text("device_name"),
  platform: text("platform"), // iOS / Android / Web
  pushToken: text("push_token"),
  isActive: boolean("is_active").default(true),
  registeredAt: timestamp("registered_at", { mode: "date", withTimezone: true }).defaultNow(),
});

// ===========================================================================
// 2. Customer Management
// ===========================================================================

export const customerGroups = pgTable("customer_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  customerType: text("customer_type").default("Corporate"),
  businessType: text("business_type"),
  defaultCreditLimit: numeric("default_credit_limit", { precision: 14, scale: 2 }).default("0"),
  maxCreditLimit: numeric("max_credit_limit", { precision: 14, scale: 2 }).default("0"),
  dueDays: integer("due_days").default(30),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customers = pgTable("customer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerNo: text("customer_no").notNull().unique(),
  name: text("name").notNull(),
  alias: text("alias"),
  customerGroupId: text("customer_group_id").references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  customerType: text("customer_type").default("Corporate"), // Corporate / Individual
  businessType: text("business_type"),
  businessNature: text("business_nature"),
  logoUrl: text("logo_url"),
  officeAddress: text("office_address"),
  officeAddressCity: text("office_address_city"),
  officeAddressCountry: text("office_address_country"),
  emailAddress: text("email_address"),
  phoneNo: text("phone_no"),
  currencyCode: text("currency_code").default("IDR"),
  dueDays: integer("due_days").default(30),
  gracePeriod: integer("grace_period").default(7),
  taxIdType: text("tax_id_type"),
  taxIdNo: text("tax_id_no"),
  taxPayerName: text("tax_payer_name"),
  creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }).default("0"),
  creditOnHold: numeric("credit_on_hold", { precision: 14, scale: 2 }).default("0"),
  creditInUsed: numeric("credit_in_used", { precision: 14, scale: 2 }).default("0"),
  creditAvailable: numeric("credit_available", { precision: 14, scale: 2 }).default("0"),
  depositBalance: numeric("deposit_balance", { precision: 14, scale: 2 }).default("0"),
  depositOnHold: numeric("deposit_on_hold", { precision: 14, scale: 2 }).default("0"),
  depositAvailable: numeric("deposit_available", { precision: 14, scale: 2 }).default("0"),
  status: text("status").default("Active"), // Active / Inactive / Suspended
  enableRule: boolean("enable_rule").default(true),
  allowCreditOverUse: boolean("allow_credit_over_use").default(false),
  maxCreditOverUseAmount: numeric("max_credit_over_use_amount", {
    precision: 14,
    scale: 2,
  }).default("0"),
  creditOverUseValidUntil: timestamp("credit_over_use_valid_until", {
    mode: "date",
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const customerPics = pgTable("customer_pic", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title"),
  emailAddress: text("email_address"),
  phoneNo: text("phone_no"),
  mobilePhoneNo: text("mobile_phone_no"),
  dob: date("dob"),
  position: text("position"),
  division: text("division"),
  isActive: boolean("is_active").default(true),
  isHeadOfficer: boolean("is_head_officer").default(false),
  userNo: text("user_no"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerCreditMovements = pgTable("customer_credit_movement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  movementType: text("movement_type").notNull(), // Invoice / Payment / Adjustment
  movementStatus: text("movement_status").default("Settled"),
  balanceBefore: numeric("balance_before", { precision: 14, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }).notNull(),
  referenceDoc: text("reference_doc"),
  notes: text("notes"),
  movementDate: timestamp("movement_date", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerDepositMovements = pgTable("customer_deposit_movement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  movementType: text("movement_type").notNull(),
  movementStatus: text("movement_status").default("Settled"),
  balanceBefore: numeric("balance_before", { precision: 14, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }).notNull(),
  referenceDoc: text("reference_doc"),
  notes: text("notes"),
  movementDate: timestamp("movement_date", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerAgreementDocs = pgTable("customer_agreement_doc", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  documentNo: text("document_no").notNull(),
  title: text("title").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  fileId: text("file_id"),
  fileUrl: text("file_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerRefundAccounts = pgTable("customer_refund_account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
  bankBranch: text("bank_branch"),
  accountNo: text("account_no").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  isPrimary: boolean("is_primary").default(true),
});

export const listOfCustomerLabels = pgTable("list_of_customer_label", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  isPublic: boolean("is_public").default(true),
});

export const customerLabelAssignments = pgTable("customer_label_assignment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  labelId: text("label_id")
    .notNull()
    .references(() => listOfCustomerLabels.id, { onDelete: "cascade" }),
  createdDate: timestamp("created_date", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerRules = pgTable("customer_rule", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  ruleType: text("rule_type").notNull().default("BookingRestriction"),
  conditionKey: text("condition_key").notNull(),
  conditionOperator: text("condition_operator").notNull().default("eq"),
  conditionValue: text("condition_value").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerRuleTemplates = pgTable("customer_rule_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const customerRuleTemplateDetails = pgTable(
  "customer_rule_template_detail",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: text("template_id")
      .notNull()
      .references(() => customerRuleTemplates.id, { onDelete: "cascade" }),
    ruleType: text("rule_type").notNull().default("BookingRestriction"),
    conditionKey: text("condition_key").notNull(),
    conditionOperator: text("condition_operator").notNull().default("eq"),
    conditionValue: text("condition_value").notNull(),
  },
);

// ===========================================================================
// 3. Core Operations & Master Data
// ===========================================================================

export const products = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productCode: text("product_code").notNull().unique(),
  productType: text("product_type").notNull(), // Tour / TravelDoc
  name: text("name").notNull(),
  optString1: text("opt_string_1"), // MainCity / DocType
  optString2: text("opt_string_2"), // MainCountry / PublisherCountry
  optString3: text("opt_string_3"),
  optInt1: integer("opt_int_1"), // GroupSize
  optInt2: integer("opt_int_2"), // MinimumAge
  optInt3: integer("opt_int_3"), // Duration days
  bookingDepositPercent: numeric("booking_deposit_percent", { precision: 5, scale: 2 }),
  bookingDepositAmount: numeric("booking_deposit_amount", { precision: 14, scale: 2 }),
  bookingNotes: text("booking_notes"),
  tags: text("tags"),
  vendorId: text("vendor_id"),
  disableBooking: boolean("disable_booking").default(false),
  isArchived: boolean("is_archived").default(false),
  displaySeq: integer("display_seq").default(0),
  thumbnailFileId: text("thumbnail_file_id"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const tourDates = pgTable("tour_date", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date"),
  priceAdult: numeric("price_adult", { precision: 14, scale: 2 }).notNull(),
  priceChild: numeric("price_child", { precision: 14, scale: 2 }),
  quota: integer("quota").default(20),
  bookedCount: integer("booked_count").default(0),
  isAvailable: boolean("is_available").default(true),
});

export const airlines = pgTable("airline", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  airlineCode: text("airline_code").notNull().unique(), // IATA code
  airlineGroupCode: text("airline_group_code"),
  airlineName: text("airline_name").notNull(),
  alias: text("alias"),
  logoPath: text("logo_path"),
  companyName: text("company_name"),
  aircraft: text("aircraft"),
  officeAddress: text("office_address"),
  emailAddress: text("email_address"),
  phoneNo: text("phone_no"),
  officialWeb: text("official_web"),
  country: text("country").default("ID"),
  requestPassengerIdentityNo: boolean("request_passenger_identity_no").default(true),
  showOnAirlineSection: boolean("show_on_airline_section").default(true),
});

export const airports = pgTable("airport", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  airportCode: text("airport_code").notNull().unique(), // IATA
  airportName: text("airport_name").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  icao: text("icao"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timeZone: text("time_zone"),
  showOnSearchAirport: boolean("show_on_search_airport").default(true),
});

export const promotions = pgTable("promotion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  promoName: text("promo_name").notNull(),
  promoCode: text("promo_code").notNull().unique(),
  promotionType: text("promotion_type").default("DiscountPrice"),
  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  effectiveDateFrom: timestamp("effective_date_from", { mode: "date", withTimezone: true }).notNull(),
  effectiveDateTo: timestamp("effective_date_to", { mode: "date", withTimezone: true }).notNull(),
  totalAvailable: integer("total_available"),
  numberOfUse: integer("number_of_use").default(0),
  isEnabled: boolean("is_enabled").default(true),
  description: text("description"),
  tags: text("tags"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const paymentGatewayPaymentMethods = pgTable("payment_gateway_payment_method", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  methodCode: text("method_code").notNull().unique(),
  methodName: text("method_name").notNull(),
  methodGroup: text("method_group").notNull(), // VirtualAccount / CreditCard / QRIS
  merchantCode: text("merchant_code"),
  feeInPercentage: numeric("fee_in_percentage", { precision: 5, scale: 2 }).default("0"),
  minFeeAmount: numeric("min_fee_amount", { precision: 14, scale: 2 }).default("0"),
  imagePath: text("image_path"),
  isDefault: boolean("is_default").default(false),
  isEnabled: boolean("is_enabled").default(true),
});

export const docNumberTemplates = pgTable("doc_number_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupName: text("group_name").notNull(),
  name: text("name").notNull().unique(),
  format: text("format").notNull(), // e.g. INV/{yy}{MM}/{seq:5}
  prefix: text("prefix"),
  suffix: text("suffix"),
  lastUsed: timestamp("last_used", { mode: "date", withTimezone: true }),
  startFrom: integer("start_from").default(1),
  nextNumber: integer("next_number").default(1),
  resetFrequency: text("reset_frequency").default("Monthly"), // None / Daily / Monthly / Yearly
  description: text("description"),
});

export const notificationTemplates = pgTable("notification_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  groupName: text("group_name").default("System"),
  langCode: text("lang_code").default("id"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  notificationType: text("notification_type").default("Email"), // Email / Push / SMS
  isEnabled: boolean("is_enabled").default(true),
});

export const integrations = pgTable("integration", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  serviceType: text("service_type").notNull(), // PaymentGateway / GDS / Hotel
  endPoint: text("end_point").notNull(),
  logActivity: boolean("log_activity").default(true),
  isEnabled: boolean("is_enabled").default(true),
  description: text("description"),
});

export const fileEntities = pgTable("file_entity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  generalId: text("general_id"),
  groupName: text("group_name"),
  category: text("category"),
  contentType: text("content_type"),
  fileName: text("file_name").notNull(),
  fileSize: numeric("file_size", { precision: 14, scale: 2 }),
  fileExt: text("file_ext"),
  absoluteUrl: text("absolute_url").notNull(),
  storageProvider: text("storage_provider").default("AwsS3"),
  awsBucketName: text("aws_bucket_name"),
  fullPath: text("full_path"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const appSettings = pgTable("app_setting", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupName: text("group_name").notNull(),
  name: text("name").notNull().unique(),
  dataType: text("data_type").default("String"),
  defaultValue: text("default_value"),
  description: text("description"),
});

// App Menus (Sidebar & Dynamic Navigation Tabs)
export const appMenus = pgTable("app_menu", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupTitle: text("group_title").notNull(),
  groupIcon: text("group_icon").notNull().default("Folder"),
  title: text("title").notNull(),
  url: text("url").notNull().default("#"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
  roles: text("roles").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Workflow Engine
export const workflowActions = pgTable("workflow_action", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  moduleCode: text("module_code").notNull(),
  code: text("code").notNull().unique(), // e.g. INV.Approve
  name: text("name").notNull(),
});

export const workflowRules = pgTable("workflow_rule", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workflowActionId: text("workflow_action_id")
    .notNull()
    .references(() => workflowActions.id, { onDelete: "cascade" }),
  departmentCode: text("department_code"),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const workflowSteps = pgTable("workflow_step", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workflowRuleId: text("workflow_rule_id")
    .notNull()
    .references(() => workflowRules.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull(),
  requiredRole: text("required_role").notNull(),
  departmentScope: text("department_scope").default("Any"),
  minAmount: numeric("min_amount", { precision: 14, scale: 2 }),
  maxAmount: numeric("max_amount", { precision: 14, scale: 2 }),
});

export const docApprovalRequests = pgTable("doc_approval_request", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workflowRuleId: text("workflow_rule_id").references(() => workflowRules.id, {
    onDelete: "set null",
  }),
  documentType: text("document_type").notNull(), // INVOICE / REFUND / CREDIT_LIMIT
  documentId: text("document_id").notNull(),
  requesterUserId: text("requester_user_id").notNull(),
  requesterDepartment: text("requester_department"),
  currentStepOrder: integer("current_step_order").default(1),
  status: text("status").default("Pending"), // Pending / Approved / Rejected / Cancelled
  amount: numeric("amount", { precision: 14, scale: 2 }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const docApprovalWorkflowLogs = pgTable("doc_approval_workflow_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  approvalRequestId: text("approval_request_id")
    .notNull()
    .references(() => docApprovalRequests.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull(),
  actionByUserId: text("action_by_user_id").notNull(),
  actionByDepartment: text("action_by_department"),
  status: text("status").notNull(), // Approved / Rejected / Revised
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

// ===========================================================================
// 4. B2C Operations & Bookings
// ===========================================================================

export const bookingFlights = pgTable("booking_flight", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reservationCode: text("reservation_code").notNull().unique(),
  bookingCode: text("booking_code"),
  bookedBy: text("booked_by").references(() => users.id, { onDelete: "set null" }),
  emailAlert: text("email_alert"),
  contactNo: text("contact_no"),
  itinerary: text("itinerary"),
  routeType: text("route_type").default("OneWay"), // OneWay / RoundTrip / MultiCity
  cabinClass: text("cabin_class").default("Economy"),
  flightType: text("flight_type").default("Domestic"),
  totalAdult: integer("total_adult").default(1),
  totalChild: integer("total_child").default(0),
  totalInfant: integer("total_infant").default(0),
  baseFare: numeric("base_fare", { precision: 14, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 14, scale: 2 }).default("0"),
  billAmount: numeric("bill_amount", { precision: 14, scale: 2 }).default("0"),
  vendorReservationId: text("vendor_reservation_id"),
  vendorPnr: text("vendor_pnr"),
  status: text("status").default("Booked"), // Booked / Issued / Cancelled / Failed
  issued: boolean("issued").default(false),
  issuedAt: timestamp("issued_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const bookingFlightDetails = pgTable("booking_flight_detail", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingFlightId: text("booking_flight_id")
    .notNull()
    .references(() => bookingFlights.id, { onDelete: "cascade" }),
  sequenceNumber: integer("sequence_number").default(1),
  airlineCode: text("airline_code").notNull(),
  airlineName: text("airline_name"),
  flightNumber: text("flight_number").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departDate: timestamp("depart_date", { mode: "date", withTimezone: true }).notNull(),
  arriveDate: timestamp("arrive_date", { mode: "date", withTimezone: true }).notNull(),
  flightDuration: integer("flight_duration"), // minutes
  cabinClass: text("cabin_class"),
});

export const bookingFlightPaxes = pgTable("booking_flight_pax", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingFlightId: text("booking_flight_id")
    .notNull()
    .references(() => bookingFlights.id, { onDelete: "cascade" }),
  prefix: text("prefix"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  gender: text("gender"),
  travelerType: text("traveler_type").default("Adult"),
  dateOfBirth: date("date_of_birth"),
  identityNo: text("identity_no"),
  passportNo: text("passport_no"),
  nationality: text("nationality").default("ID"),
  userPassengerId: text("user_passenger_id").references(() => userPassengers.id, {
    onDelete: "set null",
  }),
});

export const bookingHotels = pgTable("booking_hotel", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reservationCode: text("reservation_code").notNull().unique(),
  bookedBy: text("booked_by").references(() => users.id, { onDelete: "set null" }),
  hotelName: text("hotel_name").notNull(),
  city: text("city").notNull(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  totalRooms: integer("total_rooms").default(1),
  totalAdult: integer("total_adult").default(1),
  totalChild: integer("total_child").default(0),
  baseFare: numeric("base_fare", { precision: 14, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 14, scale: 2 }).default("0"),
  billAmount: numeric("bill_amount", { precision: 14, scale: 2 }).default("0"),
  status: text("status").default("Booked"),
  issued: boolean("issued").default(false),
  issuedAt: timestamp("issued_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const bookingHotelRooms = pgTable("booking_hotel_room", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingHotelId: text("booking_hotel_id")
    .notNull()
    .references(() => bookingHotels.id, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
  qty: integer("qty").default(1),
  bedType: text("bed_type"),
  includeBreakfast: boolean("include_breakfast").default(false),
  pricePerNight: numeric("price_per_night", { precision: 14, scale: 2 }),
});

export const billings = pgTable("billing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingType: text("booking_type").notNull(), // Flight / Hotel / Tour
  bookingId: text("booking_id").notNull(),
  billingNo: text("billing_no").notNull().unique(),
  orderNo: text("order_no"),
  basePrice: numeric("base_price", { precision: 14, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 14, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  billAmount: numeric("bill_amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0"),
  expiredAt: timestamp("expired_at", { mode: "date", withTimezone: true }),
  paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
  paymentChannel: text("payment_channel"),
  billingStatus: text("billing_status").default("Pending"), // Pending / Paid / Cancelled / Expired
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const billingDetails = pgTable("billing_detail", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  billingId: text("billing_id")
    .notNull()
    .references(() => billings.id, { onDelete: "cascade" }),
  itemCode: text("item_code"),
  itemName: text("item_name").notNull(),
  qty: integer("qty").default(1),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 14, scale: 2 }).notNull(),
});

export const bookingContacts = pgTable("booking_contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingType: text("booking_type").notNull(),
  bookingId: text("booking_id").notNull(),
  fullName: text("full_name").notNull(),
  emailAddress: text("email_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  countryCode: text("country_code").default("ID"),
});

export const bookingCustomerCancellationRequests = pgTable(
  "booking_customer_cancellation_request",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookingType: text("booking_type").notNull(),
    bookingId: text("booking_id").notNull(),
    reason: text("reason").notNull(),
    refundStatus: text("refund_status").default("Pending"), // Pending / Approved / Denied
    refundAmount: numeric("refund_amount", { precision: 14, scale: 2 }),
    adminNotes: text("admin_notes"),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  },
);

export const bookingLogs = pgTable("booking_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingType: text("booking_type").notNull(),
  bookingId: text("booking_id").notNull(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  remarks: text("remarks"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  loggedAt: timestamp("logged_at", { mode: "date", withTimezone: true }).defaultNow(),
});

// ===========================================================================
// 5. Invoice Management
// ===========================================================================

export const invoices = pgTable("invoice", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceNo: text("invoice_no").notNull().unique(),
  customerNo: text("customer_no").notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  productGroup: text("product_group").default("Flight"),
  productCode: text("product_code"),
  dueDays: integer("due_days").default(30),
  dueDate: date("due_date").notNull(),
  currencyCode: text("currency_code").default("IDR"),
  netFare: numeric("net_fare", { precision: 14, scale: 2 }).default("0"),
  serviceFee: numeric("service_fee", { precision: 14, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  gst: numeric("gst", { precision: 14, scale: 2 }).default("0"),
  billingAmount: numeric("billing_amount", { precision: 14, scale: 2 }).notNull(),
  billingStatus: text("billing_status").default("Unpaid"), // Unpaid / PartiallyPaid / Paid
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 14, scale: 2 }).default("0"),
  invoiceType: text("invoice_type").default("Regular"),
  invoiceStatus: text("invoice_status").default("Draft"), // Draft / Submitted / Confirmed / Finalized
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const flightReservations = pgTable("flight_reservation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reservationNo: text("reservation_no").notNull().unique(),
  invoiceId: text("invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  pnrCode: text("pnr_code").notNull(),
  routeType: text("route_type").default("Domestic"),
  flightType: text("flight_type").default("OneWay"),
  flightClass: text("flight_class").default("Economy"),
  adult: integer("adult").default(1),
  child: integer("child").default(0),
  infant: integer("infant").default(0),
  status: text("status").default("Active"),
  netFare: numeric("net_fare", { precision: 14, scale: 2 }).default("0"),
  serviceFee: numeric("service_fee", { precision: 14, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  subTotal: numeric("sub_total", { precision: 14, scale: 2 }).notNull(),
  description: text("description"),
});

export const payments = pgTable("payment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  paymentNo: text("payment_no").notNull().unique(),
  receivedAt: timestamp("received_at", { mode: "date", withTimezone: true }).defaultNow(),
  receivedAccnt: text("received_accnt").notNull(),
  currencyCode: text("currency_code").default("IDR"),
  receivedAmt: numeric("received_amt", { precision: 14, scale: 2 }).notNull(),
  allocated: numeric("allocated", { precision: 14, scale: 2 }).default("0"),
  unallocated: numeric("unallocated", { precision: 14, scale: 2 }).notNull(),
  allocationStatus: text("allocation_status").default("Unallocated"), // Unallocated / PartiallyAllocated / FullyAllocated
});

export const invoicePayments = pgTable("invoice_payment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date", { mode: "date", withTimezone: true }).defaultNow(),
  allocationNote: text("allocation_note"),
});

// ===========================================================================
// 6. Content Management & Web Management
// ===========================================================================

export const blogArticles = pgTable("blog_article", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  subTitle: text("sub_title"),
  content: text("content").notNull(),
  langCode: text("lang_code").default("id"),
  category: text("category").default("Travel"),
  tags: text("tags"),
  showInHomePage: boolean("show_in_home_page").default(false),
  readTime: integer("read_time").default(3),
  isArchived: boolean("is_archived").default(false),
  bannerFileId: text("banner_file_id"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const staticContents = pgTable("static_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  pageCode: text("page_code").notNull().unique(), // ABOUT_US / TERMS / PRIVACY
  pageTitle: text("page_title").notNull(),
  contentHtml: text("content_html").notNull(),
  langCode: text("lang_code").default("id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const subscribers = pgTable("subscriber", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  emailAddress: text("email_address").notNull().unique(),
  isSubscribed: boolean("is_subscribed").default(true),
  subscribedAt: timestamp("subscribed_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const visitors = pgTable("visitor", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  loggedAsUserId: text("logged_as_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  ipv4: text("ipv4"),
  countryCode: text("country_code"),
  countryName: text("country_name"),
  city: text("city"),
  deviceType: text("device_type"),
  deviceOs: text("device_os"),
  entryPoint: text("entry_point"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

// Legacy posts table for backwards compatibility
export const posts = pgTable("post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ===========================================================================
// RBAC Extensions & Activity Audit
// ===========================================================================

export const roleMenuPermissions = pgTable("role_menu_permission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roleId: text("role_id")
    .notNull()
    .references(() => adminUserRoles.id, { onDelete: "cascade" }),
  menuId: text("menu_id")
    .notNull()
    .references(() => appMenus.id, { onDelete: "cascade" }),
});

export const userPermissionOverrides = pgTable("user_permission_override", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  permissionCode: text("permission_code")
    .notNull()
    .references(() => listOfUserPermissions.code, { onDelete: "cascade" }),
  effect: text("effect").notNull().default("allow"),
});

export const activityLogs = pgTable("activity_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ===========================================================================
// 7. Drizzle Relations
// ===========================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  passengers: many(userPassengers),
  pointMovements: many(userPointBalanceMovements),
  notifications: many(userNotifications),
  devices: many(userDevices),
  flightBookings: many(bookingFlights),
  hotelBookings: many(bookingHotels),
  posts: many(posts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userPassengersRelations = relations(userPassengers, ({ one, many }) => ({
  user: one(users, {
    fields: [userPassengers.userId],
    references: [users.id],
  }),
  flightPaxes: many(bookingFlightPaxes),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  group: one(customerGroups, {
    fields: [customers.customerGroupId],
    references: [customerGroups.id],
  }),
  pics: many(customerPics),
  creditMovements: many(customerCreditMovements),
  depositMovements: many(customerDepositMovements),
  agreementDocs: many(customerAgreementDocs),
  refundAccounts: many(customerRefundAccounts),
  invoices: many(invoices),
  flightReservations: many(flightReservations),
  labelAssignments: many(customerLabelAssignments),
}));

export const customerPicsRelations = relations(customerPics, ({ one }) => ({
  customer: one(customers, {
    fields: [customerPics.customerId],
    references: [customers.id],
  }),
}));

export const bookingFlightsRelations = relations(bookingFlights, ({ one, many }) => ({
  user: one(users, {
    fields: [bookingFlights.bookedBy],
    references: [users.id],
  }),
  details: many(bookingFlightDetails),
  passengers: many(bookingFlightPaxes),
  logs: many(bookingLogs),
}));

export const bookingFlightDetailsRelations = relations(bookingFlightDetails, ({ one }) => ({
  booking: one(bookingFlights, {
    fields: [bookingFlightDetails.bookingFlightId],
    references: [bookingFlights.id],
  }),
}));

export const bookingFlightPaxesRelations = relations(bookingFlightPaxes, ({ one }) => ({
  booking: one(bookingFlights, {
    fields: [bookingFlightPaxes.bookingFlightId],
    references: [bookingFlights.id],
  }),
  userPassenger: one(userPassengers, {
    fields: [bookingFlightPaxes.userPassengerId],
    references: [userPassengers.id],
  }),
}));

export const bookingHotelsRelations = relations(bookingHotels, ({ one, many }) => ({
  user: one(users, {
    fields: [bookingHotels.bookedBy],
    references: [users.id],
  }),
  rooms: many(bookingHotelRooms),
  logs: many(bookingLogs),
}));

export const bookingHotelRoomsRelations = relations(bookingHotelRooms, ({ one }) => ({
  booking: one(bookingHotels, {
    fields: [bookingHotelRooms.bookingHotelId],
    references: [bookingHotels.id],
  }),
}));

export const billingsRelations = relations(billings, ({ many }) => ({
  details: many(billingDetails),
}));

export const billingDetailsRelations = relations(billingDetails, ({ one }) => ({
  billing: one(billings, {
    fields: [billingDetails.billingId],
    references: [billings.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  flightReservations: many(flightReservations),
  payments: many(invoicePayments),
}));

export const flightReservationsRelations = relations(flightReservations, ({ one }) => ({
  invoice: one(invoices, {
    fields: [flightReservations.invoiceId],
    references: [invoices.id],
  }),
  customer: one(customers, {
    fields: [flightReservations.customerId],
    references: [customers.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ many }) => ({
  invoicePayments: many(invoicePayments),
}));

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicePayments.invoiceId],
    references: [invoices.id],
  }),
  payment: one(payments, {
    fields: [invoicePayments.paymentId],
    references: [payments.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  tourDates: many(tourDates),
}));

export const tourDatesRelations = relations(tourDates, ({ one }) => ({
  product: one(products, {
    fields: [tourDates.productId],
    references: [products.id],
  }),
}));

export const workflowRulesRelations = relations(workflowRules, ({ one, many }) => ({
  action: one(workflowActions, {
    fields: [workflowRules.workflowActionId],
    references: [workflowActions.id],
  }),
  steps: many(workflowSteps),
  approvalRequests: many(docApprovalRequests),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  rule: one(workflowRules, {
    fields: [workflowSteps.workflowRuleId],
    references: [workflowRules.id],
  }),
}));

export const docApprovalRequestsRelations = relations(docApprovalRequests, ({ one, many }) => ({
  rule: one(workflowRules, {
    fields: [docApprovalRequests.workflowRuleId],
    references: [workflowRules.id],
  }),
  logs: many(docApprovalWorkflowLogs),
}));

export const docApprovalWorkflowLogsRelations = relations(docApprovalWorkflowLogs, ({ one }) => ({
  request: one(docApprovalRequests, {
    fields: [docApprovalWorkflowLogs.approvalRequestId],
    references: [docApprovalRequests.id],
  }),
}));

// ===========================================================================
// 8. Inferred Types
// ===========================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type AdminUserRole = typeof adminUserRoles.$inferSelect;
export type NewAdminUserRole = typeof adminUserRoles.$inferInsert;
export type AdminUserDepartment = typeof adminUserDepartments.$inferSelect;
export type NewAdminUserDepartment = typeof adminUserDepartments.$inferInsert;
export type UserPassenger = typeof userPassengers.$inferSelect;
export type NewUserPassenger = typeof userPassengers.$inferInsert;
export type CustomerGroup = typeof customerGroups.$inferSelect;
export type NewCustomerGroup = typeof customerGroups.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type CustomerPic = typeof customerPics.$inferSelect;
export type NewCustomerPic = typeof customerPics.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type TourDate = typeof tourDates.$inferSelect;
export type NewTourDate = typeof tourDates.$inferInsert;
export type Airline = typeof airlines.$inferSelect;
export type NewAirline = typeof airlines.$inferInsert;
export type Airport = typeof airports.$inferSelect;
export type NewAirport = typeof airports.$inferInsert;
export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
export type BookingFlight = typeof bookingFlights.$inferSelect;
export type NewBookingFlight = typeof bookingFlights.$inferInsert;
export type BookingFlightDetail = typeof bookingFlightDetails.$inferSelect;
export type NewBookingFlightDetail = typeof bookingFlightDetails.$inferInsert;
export type BookingFlightPax = typeof bookingFlightPaxes.$inferSelect;
export type NewBookingFlightPax = typeof bookingFlightPaxes.$inferInsert;
export type BookingHotel = typeof bookingHotels.$inferSelect;
export type NewBookingHotel = typeof bookingHotels.$inferInsert;
export type Billing = typeof billings.$inferSelect;
export type NewBilling = typeof billings.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type FlightReservation = typeof flightReservations.$inferSelect;
export type NewFlightReservation = typeof flightReservations.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type NewInvoicePayment = typeof invoicePayments.$inferInsert;
export type BlogArticle = typeof blogArticles.$inferSelect;
export type NewBlogArticle = typeof blogArticles.$inferInsert;
export type StaticContent = typeof staticContents.$inferSelect;
export type NewStaticContent = typeof staticContents.$inferInsert;
export type RoleMenuPermission = typeof roleMenuPermissions.$inferSelect;
export type NewRoleMenuPermission = typeof roleMenuPermissions.$inferInsert;
export type UserPermissionOverride = typeof userPermissionOverrides.$inferSelect;
export type NewUserPermissionOverride = typeof userPermissionOverrides.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type CustomerRule = typeof customerRules.$inferSelect;
export type NewCustomerRule = typeof customerRules.$inferInsert;
export type CustomerRuleTemplate = typeof customerRuleTemplates.$inferSelect;
export type NewCustomerRuleTemplate = typeof customerRuleTemplates.$inferInsert;
export type CustomerRuleTemplateDetail =
  typeof customerRuleTemplateDetails.$inferSelect;
export type NewCustomerRuleTemplateDetail =
  typeof customerRuleTemplateDetails.$inferInsert;
export type AppMenu = typeof appMenus.$inferSelect;
export type NewAppMenu = typeof appMenus.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

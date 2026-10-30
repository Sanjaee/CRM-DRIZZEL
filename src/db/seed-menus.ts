import { db } from "@/db"
import { appMenus } from "@/db/schema"

export const DEFAULT_SEED_MENUS = [
  // 1. Bookings
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Booking Car",
    url: "/admin/bookings/car",
    icon: "Car",
    order: 1,
    roles: "admin,user",
  },
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Booking Tour",
    url: "/admin/bookings/tour",
    icon: "MapPin",
    order: 2,
    roles: "admin,user",
  },
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Cancel Order Request",
    url: "/admin/bookings/cancel-requests",
    icon: "XCircle",
    order: 3,
    roles: "admin,user",
  },
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Booking Hotel",
    url: "/admin/bookings/hotel",
    icon: "Hotel",
    order: 4,
    roles: "admin,user",
  },
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Booking Flight",
    url: "/admin/bookings/flight",
    icon: "Plane",
    order: 5,
    roles: "admin,user",
  },
  {
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "Realtime Order",
    url: "/admin/bookings/realtime-order",
    icon: "Activity",
    order: 6,
    roles: "admin,user",
  },

  // 2. Products
  {
    groupTitle: "Products",
    groupIcon: "Briefcase",
    title: "Tours",
    url: "/admin/products/tours",
    icon: "Compass",
    order: 1,
    roles: "admin,user",
  },
  {
    groupTitle: "Products",
    groupIcon: "Briefcase",
    title: "Travel Docs",
    url: "/admin/products/travel-docs",
    icon: "FileText",
    order: 2,
    roles: "admin,user",
  },

  // 3. Campaigns
  {
    groupTitle: "Campaigns",
    groupIcon: "Tag",
    title: "Promotions",
    url: "/admin/campaigns/promotions",
    icon: "Percent",
    order: 1,
    roles: "admin,user",
  },

  // 4. Contents
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Page Contents",
    url: "/admin/contents/page-contents",
    icon: "Layout",
    order: 1,
    roles: "admin,user",
  },
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Blog Article",
    url: "/admin/contents/blog-article",
    icon: "BookOpen",
    order: 2,
    roles: "admin,user",
  },
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Labeling",
    url: "/admin/contents/labeling",
    icon: "Bookmark",
    order: 3,
    roles: "admin,user",
  },
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Notification Template",
    url: "/admin/contents/notification-template",
    icon: "Bell",
    order: 4,
    roles: "admin,user",
  },
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Generic Value",
    url: "/admin/contents/generic-value",
    icon: "Sliders",
    order: 5,
    roles: "admin,user",
  },
  {
    groupTitle: "Contents",
    groupIcon: "Newspaper",
    title: "Document Templates",
    url: "/admin/contents/document-templates",
    icon: "FileCheck",
    order: 6,
    roles: "admin,user",
  },

  // 5. Master Data
  {
    groupTitle: "Master Data",
    groupIcon: "Database",
    title: "Airlines",
    url: "/admin/master-data/airlines",
    icon: "PlaneTakeoff",
    order: 1,
    roles: "admin",
  },
  {
    groupTitle: "Master Data",
    groupIcon: "Database",
    title: "Airports",
    url: "/admin/master-data/airports",
    icon: "Navigation",
    order: 2,
    roles: "admin",
  },

  // 6. Customer Management
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Customers",
    url: "/admin/customer-management/customers",
    icon: "UserCheck",
    order: 1,
    roles: "admin",
  },
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Web Users",
    url: "/admin/customer-management/web-users",
    icon: "Globe",
    order: 2,
    roles: "admin",
  },
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Customer Groups",
    url: "/admin/customer-management/customer-groups",
    icon: "Network",
    order: 3,
    roles: "admin",
  },
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Cust. Rule Templates",
    url: "/admin/customer-management/rule-templates",
    icon: "FileSpreadsheet",
    order: 4,
    roles: "admin",
  },
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Agreement Monitoring",
    url: "/admin/customer-management/agreement-monitoring",
    icon: "FileSearch",
    order: 5,
    roles: "admin",
  },
  {
    groupTitle: "Customer Management",
    groupIcon: "Users",
    title: "Cust. Labels",
    url: "/admin/customer-management/cust-labels",
    icon: "Tags",
    order: 6,
    roles: "admin",
  },

  // 7. User & Permissions
  {
    groupTitle: "User & Permissions",
    groupIcon: "ShieldCheck",
    title: "Admin Roles",
    url: "/admin/user-permissions/admin-roles",
    icon: "Shield",
    order: 1,
    roles: "admin",
  },
  {
    groupTitle: "User & Permissions",
    groupIcon: "ShieldCheck",
    title: "Admin Users",
    url: "/admin/user-permissions/admin-users",
    icon: "UserCog",
    order: 2,
    roles: "admin",
  },
  {
    groupTitle: "User & Permissions",
    groupIcon: "ShieldCheck",
    title: "Admin Departments",
    url: "/admin/user-permissions/admin-departments",
    icon: "Building",
    order: 3,
    roles: "admin",
  },

  // 8. Reports
  {
    groupTitle: "Reports",
    groupIcon: "FileText",
    title: "Sales Report",
    url: "/admin/reports/sales-report",
    icon: "TrendingUp",
    order: 1,
    roles: "admin",
  },

  // 9. Tools
  {
    groupTitle: "Tools",
    groupIcon: "Wrench",
    title: "Payment Link",
    url: "/admin/tools/payment-link",
    icon: "Link",
    order: 1,
    roles: "admin",
  },
  {
    groupTitle: "Tools",
    groupIcon: "Wrench",
    title: "Scheduler Jobs",
    url: "/admin/tools/scheduler-jobs",
    icon: "Clock",
    order: 2,
    roles: "admin",
  },

  // 10. Settings
  {
    groupTitle: "Settings",
    groupIcon: "Settings",
    title: "App Menu",
    url: "/admin/settings/app-menu",
    icon: "Menu",
    order: 1,
    roles: "admin",
  },
  {
    groupTitle: "Settings",
    groupIcon: "Settings",
    title: "App Setting",
    url: "/admin/settings/app-setting",
    icon: "SlidersHorizontal",
    order: 2,
    roles: "admin",
  },
  {
    groupTitle: "Settings",
    groupIcon: "Settings",
    title: "File Upload",
    url: "/admin/settings/file-upload",
    icon: "UploadCloud",
    order: 3,
    roles: "admin",
  },
  {
    groupTitle: "Settings",
    groupIcon: "Settings",
    title: "Integration",
    url: "/admin/settings/integration",
    icon: "Layers",
    order: 4,
    roles: "admin",
  },
]

export async function ensureAppMenuTable() {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL!)
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "app_menu" (
      "id" text PRIMARY KEY,
      "group_title" text NOT NULL,
      "group_icon" text DEFAULT 'Folder' NOT NULL,
      "title" text NOT NULL,
      "url" text DEFAULT '#' NOT NULL,
      "icon" text,
      "order" integer DEFAULT 0 NOT NULL,
      "roles" text DEFAULT 'admin' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
      "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
    );
  `)
}

export async function seedDefaultMenus(force = false) {
  await ensureAppMenuTable()
  const currentMenus = await db.select().from(appMenus)
  if (currentMenus.length > 0 && !force) {
    return { count: currentMenus.length, seeded: false }
  }

  if (force && currentMenus.length > 0) {
    await db.delete(appMenus)
  }

  await db.insert(appMenus).values(
    DEFAULT_SEED_MENUS.map((item) => ({
      ...item,
      isActive: true,
    }))
  )

  return { count: DEFAULT_SEED_MENUS.length, seeded: true }
}

if (process.argv[1]?.endsWith("seed-menus.ts")) {
  seedDefaultMenus(true)
    .then((res) => console.log("Seeding finished successfully:", res))
    .catch((err) => console.error("Seeding failed:", err))
}

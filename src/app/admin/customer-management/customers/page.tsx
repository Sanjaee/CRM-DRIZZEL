import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc, eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { customerGroups, customers } from "@/db/schema"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import { deleteCustomerAction } from "@/lib/customer-actions"

import { CustomerManager } from "./customer-manager"

export default function CustomersPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <CustomersContent />
    </Suspense>
  )
}

async function CustomersContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select({
      id: customers.id,
      customerNo: customers.customerNo,
      name: customers.name,
      alias: customers.alias,
      emailAddress: customers.emailAddress,
      customerType: customers.customerType,
      creditLimit: customers.creditLimit,
      status: customers.status,
      groupName: customerGroups.name,
    })
    .from(customers)
    .leftJoin(customerGroups, eq(customers.customerGroupId, customerGroups.id))
    .orderBy(asc(customers.name))

  return <CustomerManager rows={rows} deleteAction={deleteCustomerAction} />
}

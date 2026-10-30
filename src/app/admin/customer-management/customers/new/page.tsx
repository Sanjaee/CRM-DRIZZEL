import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { customerGroups } from "@/db/schema"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import { createCustomerAction } from "@/lib/customer-actions"

import { CustomerWizard } from "./customer-wizard"

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <NewCustomerContent />
    </Suspense>
  )
}

async function NewCustomerContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const groups = await db
    .select({ id: customerGroups.id, name: customerGroups.name })
    .from(customerGroups)
    .orderBy(asc(customerGroups.name))

  return (
    <CustomerWizard
      groups={groups.map((group) => ({ label: group.name, value: group.id }))}
      createAction={createCustomerAction}
    />
  )
}

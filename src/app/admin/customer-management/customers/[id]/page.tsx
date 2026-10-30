import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { asc, desc, eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import {
  customerAgreementDocs,
  customerCreditMovements,
  customerDepositMovements,
  customerGroups,
  customerLabelAssignments,
  customerPics,
  customerRefundAccounts,
  customerRules,
  customers,
  listOfCustomerLabels,
} from "@/db/schema"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"

import { CustomerDetail } from "./customer-detail"

export default function CustomerDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <CustomerDetailContent params={props.params} />
    </Suspense>
  )
}

async function CustomerDetailContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const { id } = await params

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1)

  if (!customer) notFound()

  const [
    groupRow,
    pics,
    agreements,
    refundAccounts,
    rules,
    creditMovements,
    depositMovements,
    allLabels,
    assignments,
  ] = await Promise.all([
    customer.customerGroupId
      ? db
          .select({ name: customerGroups.name })
          .from(customerGroups)
          .where(eq(customerGroups.id, customer.customerGroupId))
          .limit(1)
      : Promise.resolve([] as { name: string | null }[]),
    db
      .select()
      .from(customerPics)
      .where(eq(customerPics.customerId, id))
      .orderBy(asc(customerPics.name)),
    db
      .select()
      .from(customerAgreementDocs)
      .where(eq(customerAgreementDocs.customerId, id))
      .orderBy(desc(customerAgreementDocs.startDate)),
    db
      .select()
      .from(customerRefundAccounts)
      .where(eq(customerRefundAccounts.customerId, id)),
    db
      .select()
      .from(customerRules)
      .where(eq(customerRules.customerId, id))
      .orderBy(asc(customerRules.ruleType)),
    db
      .select()
      .from(customerCreditMovements)
      .where(eq(customerCreditMovements.customerId, id))
      .orderBy(desc(customerCreditMovements.movementDate))
      .limit(50),
    db
      .select()
      .from(customerDepositMovements)
      .where(eq(customerDepositMovements.customerId, id))
      .orderBy(desc(customerDepositMovements.movementDate))
      .limit(50),
    db
      .select({
        id: listOfCustomerLabels.id,
        name: listOfCustomerLabels.name,
        color: listOfCustomerLabels.color,
        isPublic: listOfCustomerLabels.isPublic,
      })
      .from(listOfCustomerLabels)
      .orderBy(asc(listOfCustomerLabels.name)),
    db
      .select({ labelId: customerLabelAssignments.labelId })
      .from(customerLabelAssignments)
      .where(eq(customerLabelAssignments.customerId, id)),
  ])

  return (
    <CustomerDetail
      customer={customer}
      groupName={groupRow[0]?.name ?? null}
      pics={pics}
      agreements={agreements}
      refundAccounts={refundAccounts}
      rules={rules}
      creditMovements={creditMovements}
      depositMovements={depositMovements}
      labels={allLabels}
      assignedLabelIds={assignments.map((assignment) => assignment.labelId)}
    />
  )
}

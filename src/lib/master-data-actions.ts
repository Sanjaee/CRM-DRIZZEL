"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { airlines, airports } from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"

const AIRLINE_PATH = "/admin/master-data/airlines"
const AIRPORT_PATH = "/admin/master-data/airports"

const airlineSchema = z.object({
  airlineCode: z.string().trim().min(1, "Kode maskapai wajib diisi").max(10),
  airlineName: z.string().trim().min(1, "Nama maskapai wajib diisi"),
  alias: z.string().trim().optional(),
  country: z.string().trim().optional(),
  phoneNo: z.string().trim().optional(),
  emailAddress: z
    .union([z.literal(""), z.string().email("Email tidak valid")])
    .optional(),
})

const airportSchema = z.object({
  airportCode: z.string().trim().min(1, "Kode bandara wajib diisi").max(10),
  airportName: z.string().trim().min(1, "Nama bandara wajib diisi"),
  city: z.string().trim().min(1, "Kota wajib diisi"),
  country: z.string().trim().min(1, "Negara wajib diisi"),
  icao: z.string().trim().optional(),
})

export async function createAirlineAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("airline.create")
    const data = airlineSchema.parse(input)
    const [row] = await db
      .insert(airlines)
      .values({
        airlineCode: data.airlineCode,
        airlineName: data.airlineName,
        alias: data.alias || null,
        country: data.country || "ID",
        phoneNo: data.phoneNo || null,
        emailAddress: data.emailAddress || null,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "airline",
      resourceId: row.id,
      meta: { airlineCode: data.airlineCode },
    })
    revalidatePath(AIRLINE_PATH)
    return ok(row, "Maskapai berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateAirlineAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("airline.update")
    const data = airlineSchema.parse(input)
    await db
      .update(airlines)
      .set({
        airlineCode: data.airlineCode,
        airlineName: data.airlineName,
        alias: data.alias || null,
        country: data.country || "ID",
        phoneNo: data.phoneNo || null,
        emailAddress: data.emailAddress || null,
      })
      .where(eq(airlines.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "airline",
      resourceId: id,
    })
    revalidatePath(AIRLINE_PATH)
    return ok(undefined, "Maskapai berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteAirlineAction(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("airline.delete")
    await db.delete(airlines).where(eq(airlines.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "airline",
      resourceId: id,
    })
    revalidatePath(AIRLINE_PATH)
    return ok(undefined, "Maskapai berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function createAirportAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("airport.create")
    const data = airportSchema.parse(input)
    const [row] = await db
      .insert(airports)
      .values({
        airportCode: data.airportCode,
        airportName: data.airportName,
        city: data.city,
        country: data.country,
        icao: data.icao || null,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "airport",
      resourceId: row.id,
    })
    revalidatePath(AIRPORT_PATH)
    return ok(row, "Bandara berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateAirportAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("airport.update")
    const data = airportSchema.parse(input)
    await db
      .update(airports)
      .set({
        airportCode: data.airportCode,
        airportName: data.airportName,
        city: data.city,
        country: data.country,
        icao: data.icao || null,
      })
      .where(eq(airports.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "airport",
      resourceId: id,
    })
    revalidatePath(AIRPORT_PATH)
    return ok(undefined, "Bandara berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteAirportAction(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("airport.delete")
    await db.delete(airports).where(eq(airports.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "airport",
      resourceId: id,
    })
    revalidatePath(AIRPORT_PATH)
    return ok(undefined, "Bandara berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

import { config } from "dotenv"

config({ path: ".env.local" })
config()

async function main() {
  const { seedPermissions } = await import("./seed-permissions")
  const result = await seedPermissions()
  console.log("Seed permissions selesai:", result)
}

main().catch((error) => {
  console.error("Seed permissions gagal:", error)
  process.exit(1)
})

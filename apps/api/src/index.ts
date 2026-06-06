import { env } from './config/env.js'
import { connectDatabase } from './db/connection.js'
import { createApp } from './app.js'

async function main () {
  await connectDatabase()
  const app = createApp()
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start API:', err)
  process.exit(1)
})

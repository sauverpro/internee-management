/**
 * Run all pending migrations in backend/migrations/ in filename order.
 * Tracks applied migrations in a schema_migrations table.
 *
 * Usage: node scripts/migrate.js
 */

import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../src/db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../migrations')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const { rows } = await client.query('SELECT filename FROM schema_migrations')
    const applied = new Set(rows.map((r) => r.filename))

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    let count = 0
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip  ${file}`)
        continue
      }

      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`  apply ${file}`)
        count++
      } catch (err) {
        await client.query('ROLLBACK')
        throw new Error(`Migration "${file}" failed:\n  ${err.message}`)
      }
    }

    console.log(count ? `\n✓ ${count} migration(s) applied` : '\n✓ Database is up to date')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('\n✗ Migration error:', err.message)
  process.exit(1)
})

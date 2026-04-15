import { spawn, execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const colors = {
  yellow: '\x1b[33m%s\x1b[0m',
  cyan: '\x1b[36m%s\x1b[0m',
  green: '\x1b[32m%s\x1b[0m',
  red: '\x1b[31m%s\x1b[0m'
}

const rootDir = __dirname
const dbInitDir = path.join(rootDir, 'db_init')
const mainSqlFile = path.join(rootDir, 'adatbazis.sql')
const initSqlFile = path.join(dbInitDir, 'adatbazis.sql')
const tempMainSqlFile = `${mainSqlFile}.tmp`
const tempInitSqlFile = `${initSqlFile}.tmp`

const FRONTEND_URL = 'http://localhost:8090'
const DOCS_URL = 'http://localhost:8090/dokumentacio/'
const PHPMYADMIN_URL = 'http://localhost:8082'
const API_URL = 'http://localhost:3001'
const API_HEALTH_URL = `${API_URL}/health`
const DB_NAME = 'ketkereken'
const DB_CONTAINER_SERVICE = 'db'
const DB_ROOT_USER = 'root'
const DB_ROOT_PASSWORD = 'rootpw'

let systemReady = false
let shuttingDown = false

function log(message, color = colors.cyan) {
  console.log(color, message)
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function ensureDatabaseInitFile() {
  if (!fileExists(mainSqlFile)) {
    throw new Error('Nem található a projekt gyökerében az adatbazis.sql fájl.')
  }

  fs.mkdirSync(dbInitDir, { recursive: true })
  fs.copyFileSync(mainSqlFile, initSqlFile)
}

async function waitForApi(maxAttempts = 60, intervalMs = 2000) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const response = await fetch(API_HEALTH_URL)
      if (response.ok) return true
    } catch {
      // backend még nem állt fel
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  return false
}

function dumpDatabaseTo(filePath) {
  const dumpCommand = `docker compose exec -T ${DB_CONTAINER_SERVICE} mysqldump -u ${DB_ROOT_USER} -p${DB_ROOT_PASSWORD} --default-character-set=utf8mb4 --skip-extended-insert ${DB_NAME} > "${filePath}"`
  execSync(dumpCommand, { cwd: rootDir, stdio: 'ignore', shell: true })
}

function removeFileIfExists(filePath) {
  if (fileExists(filePath)) fs.unlinkSync(filePath)
}

function saveDatabaseSnapshot() {
  log('💾 Adatbázis mentése az adatbazis.sql fájlba...', colors.cyan)

  let dumpSuccessful = false

  try {
    dumpDatabaseTo(tempMainSqlFile)
    fs.copyFileSync(tempMainSqlFile, tempInitSqlFile)

    fs.renameSync(tempMainSqlFile, mainSqlFile)
    fs.renameSync(tempInitSqlFile, initSqlFile)

    log('✅ Az adatbázis sikeresen elmentve az adatbazis.sql fájlba.', colors.green)
    dumpSuccessful = true
  } catch (error) {
    log('⚠️ Nem sikerült az adatbázis mentése. A korábbi adatbazis.sql érintetlen maradt.', colors.red)
    removeFileIfExists(tempMainSqlFile)
    removeFileIfExists(tempInitSqlFile)
  }

  return dumpSuccessful
}

function stopDocker(removeVolumes) {
  const command = removeVolumes ? 'docker compose down -v' : 'docker compose down'
  execSync(command, { cwd: rootDir, stdio: 'ignore', shell: true })
}

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true

  log('\n🛑 Leállítás folyamatban...', colors.red)

  try {
    if (systemReady) {
      const dumpSuccessful = saveDatabaseSnapshot()

      if (dumpSuccessful) {
        log('🧹 Konténerek leállítása és volume törlése, hogy a következő indításkor az adatbazis.sql töltődjön be...', colors.cyan)
        stopDocker(true)
      } else {
        log('⚠️ A mentés sikertelen volt, ezért a volume megmarad az adatvesztés elkerülése miatt.', colors.yellow)
        stopDocker(false)
      }
    } else {
      log('⚠️ A rendszer nem indult el teljesen, ezért a volume megmarad.', colors.yellow)
      stopDocker(false)
    }

    log('✅ Minden leállt. Viszlát!', colors.green)
    process.exit(0)
  } catch (error) {
    console.error('Hiba a leállításkor, de a program kilép.', error)
    process.exit(1)
  }
}

async function main() {
  log('⏳ A Két Keréken rendszer indítása folyamatban...', colors.yellow)

  ensureDatabaseInitFile()

  const docker = spawn('docker', ['compose', 'up', '-d', '--build'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  })

  docker.on('close', async (code) => {
    if (code !== 0) {
      log('❌ Hiba történt a Docker indításakor.', colors.red)
      return
    }

    console.clear()
    log('⏳ A rendszer indul, backend ellenőrzése folyamatban...', colors.cyan)

    const apiReady = await waitForApi()

    if (!apiReady) {
      log('❌ A backend nem vált elérhetővé időben. Ellenőrizd a konténer logokat.', colors.red)
      return
    }

    systemReady = true
    console.clear()
    log('✅ A KÉT KERÉKEN RENDSZER SIKERESEN ELINDULT!', colors.green)
    console.log('--------------------------------------------------')
    console.log(`🌍 \x1b[36mWEBOLDAL:\x1b[0m            ${FRONTEND_URL}`)
    console.log(`📚 \x1b[36mDOKUMENTÁCIÓ:\x1b[0m        ${DOCS_URL}`)
    console.log(`🗄️ \x1b[36mADATBÁZIS:\x1b[0m           ${PHPMYADMIN_URL}`)
    console.log(`⚙️  \x1b[36mBACKEND API:\x1b[0m         ${API_URL}`)
    console.log('--------------------------------------------------')
    log('🛑 Leállításhoz és automatikus adatbázis mentéshez nyomj: CTRL + C', colors.yellow)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

process.stdin.resume()

main().catch((error) => {
  console.error('Váratlan hiba indítás közben:', error)
  process.exit(1)
})
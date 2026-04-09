import {
  By,
  createDriver,
  login,
  open,
  waitVisible,
  logPass,
  logFail
} from "./testUtils.js"

async function adminTesztek() {
  const driver = await createDriver()

  try {
    console.log("--- ADMIN TESZTEK (1) ---")

    await login(driver)
    await open(driver, "/admin")
    await waitVisible(driver, By.css("body"))
    const source = await driver.getPageSource()

    if (!source || source.length < 200) {
      throw new Error("Az admin oldal üresnek tűnik")
    }

    logPass("15. Admin oldal elérhető és tartalommal tölt be")
  } catch (err) {
    logFail("ADMIN TESZT ELBUKOTT", err)
  } finally {
    await driver.quit()
  }
}

adminTesztek()
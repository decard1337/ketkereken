import {
  By,
  createDriver,
  open,
  clickWhenVisible,
  typeInto,
  waitVisible,
  assertUrlContains,
  logPass,
  logFail,
  TEST_EMAIL,
  TEST_PASSWORD
} from "./testUtils.js"

async function authTesztek() {
  const driver = await createDriver()

  try {
    console.log("--- AUTH TESZTEK (5) ---")

    await open(driver, "/login")
    await waitVisible(driver, By.css(".authx"))
    logPass("1. Bejelentkezés oldal betölt")

    await clickWhenVisible(driver, By.css(".authx-brand"))
    await assertUrlContains(driver, "/")
    logPass("2. Bejelentkezés oldal brand link működik")

    await open(driver, "/login")
    await typeInto(driver, By.css('input[type="email"]'), "rossz@rossz.hu")
    await typeInto(driver, By.css('input[type="password"]'), "rosszjelszo")
    await clickWhenVisible(driver, By.css('button[type="submit"]'))
    await waitVisible(driver, By.css(".authx-msg.err"))
    logPass("3. Hibás bejelentkezés hibaüzenetet ad")

    await open(driver, "/register")
    await waitVisible(driver, By.css(".authx"))
    await waitVisible(driver, By.css('input[autocomplete="username"]'))
    logPass("4. Regisztráció oldal betölt")

    await open(driver, "/login")
    await typeInto(driver, By.css('input[type="email"]'), TEST_EMAIL)
    await typeInto(driver, By.css('input[type="password"]'), TEST_PASSWORD)
    await clickWhenVisible(driver, By.css('button[type="submit"]'))
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return url.includes("/terkep") || url.includes("/map") || url.includes("/feed") || url.includes("/u/")
    }, 12000)
    logPass("5. Sikeres bejelentkezés működik")
  } catch (err) {
    logFail("AUTH TESZT ELBUKOTT", err)
  } finally {
    await driver.quit()
  }
}

authTesztek()
import {
  By,
  createDriver,
  open,
  clickWhenVisible,
  waitVisible,
  assertUrlContains,
  assertUrlContainsOneOf,
  closeOnboardingIfPresent,
  logPass,
  logFail
} from "./testUtils.js"

async function navigationTesztek() {
  const driver = await createDriver()

  try {
    console.log("--- NAVIGÁCIÓ TESZTEK (4) ---")

    await open(driver, "/")
    await waitVisible(driver, By.css(".ketkereken-home"))
    logPass("6. Főoldal betölt")

    await open(driver, "/terkep")
    await waitVisible(driver, By.css("#map-container, .map-page-theme, .map-floating-title"))
    logPass("7. /terkep oldal közvetlenül betölt")

    await open(driver, "/")
    await closeOnboardingIfPresent(driver)

    const mapButton = await waitVisible(
      driver,
      By.xpath("//a[contains(., 'Térkép megnyitása') or normalize-space(.)='Térkép']")
    )

    try {
      await mapButton.click()
    } catch {
      await driver.executeScript("arguments[0].click();", mapButton)
    }

    await assertUrlContainsOneOf(driver, ["/terkep", "/map"])
    logPass("8. Főoldalról térkép megnyitható")

    await open(driver, "/login")
    await clickWhenVisible(driver, By.css('a[href="/register"]'))
    await assertUrlContains(driver, "/register")
    await clickWhenVisible(driver, By.css('a[href="/login"]'))
    await assertUrlContains(driver, "/login")
    logPass("9. Login és Register oldalak között működik a navigáció")
  } catch (err) {
    logFail("NAVIGÁCIÓ TESZT ELBUKOTT", err)
  } finally {
    await driver.quit()
  }
}

navigationTesztek()
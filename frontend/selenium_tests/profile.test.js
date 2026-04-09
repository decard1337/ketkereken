import {
  By,
  createDriver,
  login,
  open,
  waitVisible,
  clickWhenVisible,
  hoverOpenReactionAndReact,
  logPass,
  logFail,
  TEST_USERNAME
} from "./testUtils.js"

async function profileTesztek() {
  const driver = await createDriver()

  try {
    console.log("--- PROFIL TESZTEK (2) ---")

    await login(driver)
    await open(driver, `/u/${TEST_USERNAME}`)
    await waitVisible(driver, By.css(".prf-shell"))
    logPass("13. Profil oldal betölt")

    await clickWhenVisible(driver, By.xpath("//button[contains(., 'Aktivitás feed')]"))
    await waitVisible(driver, By.css(".prf-activityList, .prf-empty"))

    const triggers = await driver.findElements(By.css(".prf-reactionWrap"))
    if (triggers.length) {
      await hoverOpenReactionAndReact(
        driver,
        ".prf-reactionWrap",
        ".prf-reactionPicker .prf-reactionEmojiBtn"
      )
    }

    const commentToggles = await driver.findElements(By.css(".prf-commentsToggle"))
    if (commentToggles.length) {
      try {
        await commentToggles[0].click()
      } catch {
        await driver.executeScript("arguments[0].click();", commentToggles[0])
      }
      await driver.sleep(500)
    }

    logPass("14. Profil aktivitás feed, reakció és komment rész használható")
  } catch (err) {
    logFail("PROFIL TESZT ELBUKOTT", err)
  } finally {
    await driver.quit()
  }
}

profileTesztek()
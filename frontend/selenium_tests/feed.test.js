import {
  By,
  createDriver,
  login,
  open,
  waitVisible,
  clickWhenVisible,
  typeInto,
  hoverOpenReactionAndReact,
  findTextOnPage,
  logPass,
  logFail
} from "./testUtils.js"

async function feedTesztek() {
  const driver = await createDriver()

  try {
    console.log("--- FEED TESZTEK (3) ---")

    await login(driver)
    await open(driver, "/feed")
    await waitVisible(driver, By.css(".feed-composer"))
    logPass("10. Feed oldal és posztoló doboz betölt")

    const postText = `Selenium teszt poszt ${Date.now()}`
    await typeInto(driver, By.css(".feed-textarea"), postText)
    await clickWhenVisible(driver, By.css('.feed-composer button[type="submit"]'))
    await driver.sleep(1800)

    if (!(await findTextOnPage(driver, postText))) {
      throw new Error("Az új poszt szövege nem jelent meg")
    }
    logPass("11. Státuszposzt létrehozása működik")

    await hoverOpenReactionAndReact(
      driver,
      ".feed-reactionWrap",
      ".feed-reactionPicker .feed-reactionEmojiBtn"
    )

    const commentToggles = await driver.findElements(By.css(".feed-commentsToggle"))
    if (commentToggles.length) {
      try {
        await commentToggles[0].click()
      } catch {
        await driver.executeScript("arguments[0].click();", commentToggles[0])
      }
      await driver.sleep(500)
    }

    const commentText = `Selenium komment ${Date.now()}`
    await typeInto(driver, By.css(".feed-commentInput"), commentText)
    await clickWhenVisible(driver, By.css(".feed-commentSend"))
    await driver.sleep(1800)

    if (!(await findTextOnPage(driver, commentText))) {
      throw new Error("A komment nem jelent meg")
    }

    logPass("12. Reakció és komment működik a feeden")
  } catch (err) {
    logFail("FEED TESZT ELBUKOTT", err)
  } finally {
    await driver.quit()
  }
}

feedTesztek()
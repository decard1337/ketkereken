import { Builder, By, until } from "selenium-webdriver"
import chrome from "selenium-webdriver/chrome.js"

export const BASE_URL = process.env.BASE_URL || "http://localhost:8090"
export const TEST_EMAIL = process.env.TEST_EMAIL || "admin@admin.hu"
export const TEST_PASSWORD = process.env.TEST_PASSWORD || "anyud123"
export const TEST_USERNAME = process.env.TEST_USERNAME || "admin"

export async function createDriver() {
  const options = new chrome.Options()
  options.addArguments("--log-level=3")
  options.excludeSwitches("enable-logging")

  if (process.env.HEADLESS === "1") {
    options.addArguments("--headless=new")
    options.addArguments("--no-sandbox")
    options.addArguments("--disable-dev-shm-usage")
    options.addArguments("--window-size=1440,1000")
  }

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build()

  await driver.manage().window().maximize()
  return driver
}

export async function open(driver, path = "/") {
  await driver.get(`${BASE_URL}${path}`)
}

export async function waitVisible(driver, locator, timeout = 12000) {
  const el = await driver.wait(until.elementLocated(locator), timeout)
  await driver.wait(until.elementIsVisible(el), timeout)
  return el
}

export async function clickWhenVisible(driver, locator, timeout = 12000) {
  const el = await waitVisible(driver, locator, timeout)
  await driver.wait(until.elementIsEnabled(el), timeout)
  await el.click()
  return el
}

export async function clickJs(driver, element) {
  await driver.executeScript("arguments[0].click();", element)
}

export async function typeInto(driver, locator, text, timeout = 12000) {
  const el = await waitVisible(driver, locator, timeout)
  await el.clear()
  await el.sendKeys(text)
  return el
}

export async function assertUrlContains(driver, part, timeout = 12000) {
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl()
    return url.includes(part)
  }, timeout)
}

export async function assertUrlContainsOneOf(driver, parts, timeout = 12000) {
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl()
    return parts.some(part => url.includes(part))
  }, timeout)
}

export async function login(driver, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await open(driver, "/login")
  await typeInto(driver, By.css('input[type="email"]'), email)
  await typeInto(driver, By.css('input[type="password"]'), password)
  await clickWhenVisible(driver, By.css('button[type="submit"]'))

  await driver.wait(async () => {
    const url = await driver.getCurrentUrl()
    return (
      url.includes("/terkep") ||
      url.includes("/map") ||
      url.includes("/feed") ||
      url.includes("/u/")
    )
  }, 12000)
}

export async function closeOnboardingIfPresent(driver) {
  await driver.sleep(500)

  const overlay = await driver.findElements(By.css(".onbx-overlay"))
  if (!overlay.length) return

  const closeSelectors = [
    ".onbx-close",
    ".onbx-skip",
    ".onbx-button-secondary",
    ".onbx-button-ghost",
    ".onbx-button",
    'button[aria-label="Bezárás"]'
  ]

  for (const selector of closeSelectors) {
    const btns = await driver.findElements(By.css(selector))
    if (btns.length) {
      try {
        await btns[0].click()
        await driver.sleep(500)
        return
      } catch {
        try {
          await clickJs(driver, btns[0])
          await driver.sleep(500)
          return
        } catch {}
      }
    }
  }

  try {
    await driver.executeScript(`
      const el = document.querySelector('.onbx-overlay');
      if (el) el.remove();
    `)
    await driver.sleep(300)
  } catch {}
}

export async function hoverOpenReactionAndReact(driver, wrapSelector, emojiButtonSelector) {
  const wrap = await waitVisible(driver, By.css(wrapSelector), 12000)

  await driver.actions({ bridge: true }).move({ origin: wrap }).perform()
  await driver.sleep(700)

  let buttons = await driver.findElements(By.css(emojiButtonSelector))
  let visibleButtons = []

  for (const btn of buttons) {
    try {
      if (await btn.isDisplayed()) visibleButtons.push(btn)
    } catch {}
  }

  if (!visibleButtons.length) {
    await driver.executeScript(
      `
      const wrap = document.querySelector(arguments[0]);
      if (wrap) {
        wrap.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        wrap.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      }
      const picker = document.querySelector(arguments[1]);
      if (picker) {
        picker.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        picker.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      }
      `,
      wrapSelector,
      emojiButtonSelector.includes(".feed-") ? ".feed-reactionPicker" : ".prf-reactionPicker"
    )

    await driver.sleep(900)

    buttons = await driver.findElements(By.css(emojiButtonSelector))
    for (const btn of buttons) {
      try {
        if (await btn.isDisplayed()) visibleButtons.push(btn)
      } catch {}
    }
  }

  if (!visibleButtons.length) {
    throw new Error("Nem sikerült látható reakció gombot találni")
  }

  try {
    await visibleButtons[0].click()
  } catch {
    await clickJs(driver, visibleButtons[0])
  }

  await driver.sleep(1200)
}

export async function findTextOnPage(driver, text) {
  const source = await driver.getPageSource()
  return source.includes(text)
}

export function logPass(message) {
  console.log(`✅ ${message}`)
}

export function logFail(scope, err) {
  console.error(`❌ ${scope}:`, err.message)
}

export { By, until }
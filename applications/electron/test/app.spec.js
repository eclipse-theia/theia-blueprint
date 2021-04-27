const os = require("os");
const path = require("path");
const { remote } = require("webdriverio");
const { expect } = require("chai");

const THEIA_LOAD_TIMEOUT = 15000; // 15 seconds

function getBinaryPath() {
  const distFolder = path.join(__dirname, "..", "dist");
  switch (os.platform()) {
    case "linux":
      return path.join(
        distFolder,
        "linux-unpacked",
        "theia-blueprint"
      );
    case "win32":
      return path.join(
        distFolder,
        "win-unpacked",
        "TheiaBlueprint.exe"
      );
    case "darwin":
      return path.join(
        distFolder,
        "mac",
        "TheiaBlueprint.app",
        "Contents",
        "MacOS",
        "TheiaBlueprint"
      );
    default:
      return undefined;
  }
};

// Utility for keyboard shortcuts that execute commands where
// the key combination is the same on all platforms *except that*
// the Command key is used instead of Control on MacOS. Note that
// sometimes MacOS also uses Control. This is not handled, here
function macSafeKeyCombo(keys) {
  if (os.platform() === "darwin" && keys.includes("Control")) {
    // Puppeteer calls the Command key "Meta"
    return keys.map((k) => k === "Control" ? "Meta" : k);
  }
  return keys;
};

describe("Theia App", function() {
  // In mocha, 'this' is a common context between sibling beforeEach, afterEach, it, etc methods within the same describe.
  // Each describe has its own context.
  beforeEach(async function() {
    const binary = getBinaryPath();
    if (!binary) {
      throw new Error("Tests are not supported for this platform.")
    }

    // Start app and store connection in context (this)
    this.browser = await remote({
      // Change to info to get detailed events of webdriverio
      logLevel: "info",
      capabilities: {
        browserName: "chrome",
        "goog:chromeOptions": {
          // Path to built and packaged theia
          binary: binary,
          // Hand in workspace to load as runtime parameter
          args: [path.join(__dirname, "workspace")],
        },
      },
    });

    const appShell = await this.browser.$("#theia-app-shell");

    // mocha waits for returned promise to resolve
    // Theia is loaded once the app shell is present
    return appShell.waitForExist({
      timeout: THEIA_LOAD_TIMEOUT,
      timeoutMsg: "Theia took too long to load.",
    });
  });

  afterEach(async function() {
    try {
      await this.browser.closeWindow();
    } catch (err) {
      // Workaround: Puppeteer cannot properly connect to electron and throws an error.
      // However, the window is closed and that's all we want here.
      if (`${err}`.includes("Protocol error (Target.createTarget)")) {
        return;
      }
      // Rethrow for unexpected errors to fail test.
      throw err;
    }
  });

  it("Correct window title", async function() {
    const windowTitle = await this.browser.getTitle();
    expect(windowTitle).to.include("workspace — Theia");
  });

  it("Builtin extensions", async function() {
    // Wait a bit to make sure key handlers are registered.
    await new Promise((r) => setTimeout(r, 2000));

    // Open extensions view
    await this.browser.keys(macSafeKeyCombo(["Control", "Shift", "x"]));
    const builtinContainer = await this.browser.$(
      "#vsx-extensions-view-container--vsx-extensions\\:builtin"
    );

    // Expand builtin extensions
    const builtinHeader = await builtinContainer.$(".theia-header.header");
    await builtinHeader.click();

    // Wait for expansion to finish
    const builtin = await this.browser.$(
      "#vsx-extensions\\:builtin .theia-TreeContainer"
    );
    await builtin.waitForExist();

    // Get names of all builtin extensions
    const extensions = await builtin.$$(".theia-vsx-extension .name");
    const extensionNames = await Promise.all(
      extensions.map((e) => e.getText())
    );

    // Exemplary check a few extensions
    expect(extensionNames).to.include("Eclipse Keymap");
    expect(extensionNames).to.include("Debugger for Java");
    expect(extensionNames).to.include("TypeScript Language Basics (built-in)");
  });
});

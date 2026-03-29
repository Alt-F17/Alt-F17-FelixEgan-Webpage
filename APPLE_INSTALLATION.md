# Installation Guide for Apple Mac / MacBook

The great news is that the entire Simon Lead Extension and the Lead Form are built on standard web technologies (HTML, CSS, JavaScript) and the cross-platform Chrome Extension API. Because of this, it is **100% native and fully compatible** with macOS right out of the box. There is zero difference in how the code executes on a Mac versus a Windows machine.

Here is how to deploy this on any Apple computer.

## Requirements
* An Apple Mac (Intel or Apple Silicon M1/M2/M3).
* **Google Chrome** (or Chromium browsers like Brave, Arc, Edge) OR **Apple Safari**.

---

## Installation via Google Chrome (Recommended)

### Step 1: Transfer the Extension Folder
1. Move the `simon-lead-extension` folder onto the target Mac. You can do this via iCloud, Google Drive, AirDrop, or a USB drive. 
2. Place the folder in a permanent location where it won't be accidentally deleted (e.g., `Documents/` or `Developer/`).

### Step 2: Install in Chrome (macOS)
1. Open **Google Chrome** on the Mac.
2. In the top menu bar, click **Window** -> **Extensions**, or simply type `chrome://extensions` in the address bar and press **Return**.
3. In the top-right corner of the Extensions page, toggle **Developer mode** to the **ON** position.
4. Click the **Load unpacked** button that appears in the top-left corner.
5. A Finder window will pop up. Navigate to wherever you saved the `simon-lead-extension` folder, select the folder, and click **Select**.

### Step 3: Pin the Extension
1. Click the **Puzzle piece icon** (Extensions) next to the Chrome address bar.
2. Find **Simon Lead Extension** in the dropdown list and click the **Pin icon** next to it so it stays visible in your toolbar.

---

## Installation via Apple Safari

Safari now supports Web Extensions (Chrome-style extensions), but Apple requires them to be wrapped inside a native macOS app container before Safari can read them. Fortunately, Apple provides a built-in terminal tool to automatically convert the Chrome extension for you.

### Step 1: Convert the Extension using Xcode Command Line Tools
1. Open the **Terminal** app on your Mac (you can find it via Spotlight Search).
2. Type the following command and press **Return** to build the Safari wrapper:
   ```bash
   xcrun safari-web-extension-converter /path/to/your/simon-lead-extension
   ```
   *(Pro tip: You can type `xcrun safari-web-extension-converter ` with a space at the end, then drag-and-drop the extension folder from Finder directly into the Terminal to auto-fill the path!)*
3. A prompt will appear asking for a Project Name. You can hit **Return** to accept the default, or type something like `Simon Lead Safari`.
4. Xcode (or the command line tools) will automatically generate a new Mac app folder and open it.

### Step 2: Run the Wrapper App
1. Inside the newly created folder, find the wrapper app (e.g., `Simon Lead Safari.app`) and double-click to run it.
2. The app will open a small window with a single button: **"Quit and Open Safari Settings"**. Click it.

### Step 3: Enable the Extension in Safari
1. Safari will open its **Extensions Preferences** window automatically.
2. Check the box next to **Simon Lead Extension** to enable it.
3. *Important:* Safari will warn you about permissions. You must click **Always Allow on Every Website** (or explicitly allow it for `simon.studentworks.com` and `felixegan.me`) so the extension can read the lead data.

The extension icon will now appear to the left of the Safari URL bar!

## Step 4: Usage
1. Log into your Simon dashboard as usual.
2. Navigate to a lead.
3. Click the newly pinned extension icon.
4. Click **Fill Form**. 
5. The extension will automatically open a new tab to `https://felixegan.me/lead-form` and pass the data gracefully.
6. When done, click the **New Lead** button to automatically close the tab and return to the Simon dashboard. 

---

## Mac Troubleshooting & Differences
* **Copy/Paste:** When clicking the "Copy to Clipboard" button on the lead form, the text is copied to the universal macOS clipboard. Remember to use **Command (⌘) + V** to paste on a Mac instead of `Ctrl + V`.
* **Dark Mode:** macOS has a system-wide dark mode. The Lead Form includes our built-in toggle to bypass or override this, so the viewing experience will be perfectly controlled regardless of the user's Mac System Preferences.
* **Scrollbars:** macOS hides scrollbars by default unless actively scrolling. You might not see thick grey scrollbars in the output text area like you do on Windows, which actually makes the design look even cleaner on a Mac.

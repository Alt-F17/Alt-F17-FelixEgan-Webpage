# Activation Guide for Windows

The great news is that the entire Simon Lead Extension and the Lead Form are built on standard web technologies (HTML, CSS, JavaScript) and the cross-platform Chrome Extension API. Because of this, it is **100% native and fully compatible** with Windows right out of the box. There is zero difference in how the code executes on Windows versus macOS.

Here is how to deploy this on any Windows PC.

## Requirements
* A Windows PC (Windows 10 or 11).
* **Google Chrome** (or Chromium browsers like Brave or Microsoft Edge).

---

## Installation via Google Chrome (Recommended)

### Step 1: Transfer the Extension Folder
1. Move the `simon-lead-extension` folder onto the target PC. You can do this via Google Drive, OneDrive, a USB drive, or a network share.
2. Place the folder in a permanent location where it will not be accidentally deleted (e.g., `Documents\` or `Projects\`).

### Step 2: Install in Chrome (Windows)
1. Open **Google Chrome**.
2. In the address bar, type `chrome://extensions` and press **Enter**.
3. In the top-right corner of the Extensions page, toggle **Developer mode** to the **ON** position.
4. Click the **Load unpacked** button that appears in the top-left corner.
5. In the file picker, navigate to the `simon-lead-extension` folder, select it, and click **Select Folder**.

### Step 3: Pin the Extension
1. Click the **Puzzle piece icon** (Extensions) next to the Chrome address bar.
2. Find **Simon Lead Extension** in the dropdown list and click the **Pin icon** so it stays visible in your toolbar.

---

## Installation via Microsoft Edge (Optional)

### Step 1: Transfer the Extension Folder
1. Move the `simon-lead-extension` folder onto the target PC and place it in a permanent location.

### Step 2: Install in Edge
1. Open **Microsoft Edge**.
2. In the address bar, type `edge://extensions` and press **Enter**.
3. Toggle **Developer mode** to the **ON** position (usually in the left sidebar).
4. Click **Load unpacked**.
5. Select the `simon-lead-extension` folder and click **Select Folder**.

### Step 3: Pin the Extension
1. Click the **Extensions icon** next to the Edge address bar.
2. Find **Simon Lead Extension** and click the **Pin icon**.

---

## Step 4: Usage
1. Log into your Simon dashboard as usual.
2. Navigate to a lead.
3. Click the pinned extension icon.
4. Click **Fill Form**.
5. The extension will automatically open a new tab to `https://felixegan.me/lead-form` and pass the data gracefully.
6. When done, click the **New Lead** button to automatically close the tab and return to the Simon dashboard.

---

## Windows Troubleshooting & Notes
* **Copy/Paste:** Use **Ctrl + V** to paste after clicking "Copy to Clipboard" in the lead form.
* **Security Warnings:** Chrome or Edge may warn about Developer Mode extensions. This is expected for unpacked extensions.
* **Path Changes:** If the extension folder is moved or renamed, you must remove and re-load it from the extensions page.

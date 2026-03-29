function extractLeadInfo() {
  let firstName = '';
  let lastName = '';
  let phone = '';
  let email = '';
  let address = '';

  if (window.location.hostname === 'app.getleadflow.io') {
    // Old DOM format
    const nameInput = document.querySelector('input[placeholder="Enter opportunity name"]');
    if (nameInput && nameInput.value) {
      const parts = nameInput.value.trim().split(' ');
      if (parts.length > 0) {
        firstName = parts[0];
        if (parts.length > 1) lastName = parts.slice(1).join(' ');
      }
    }

    // New DOM format
    const fNameInput = document.querySelector('input[name="contact.first_name"]');
    if (fNameInput && fNameInput.value) firstName = fNameInput.value.trim();
    
    const lNameInput = document.querySelector('input[name="contact.last_name"]');
    if (lNameInput && lNameInput.value) lastName = lNameInput.value.trim();

    const phoneInput = document.querySelector('input[name="contact.phone"], input[placeholder="Phone"]');
    if (phoneInput && phoneInput.value) phone = phoneInput.value.trim();

    // Check for Email by name attribute or placeholder
    const emailInput = document.querySelector('input[name="contact.email"], input[placeholder="Enter Email"], input[placeholder="Email"]');
    if (emailInput && emailInput.value) email = emailInput.value.trim();

    // Try to grab address if they have configured it (common variants)
    const addressInput = document.querySelector('input[name="contact.address1"], input[name="contact.address_1"], input[placeholder="Address"]');
    if (addressInput && addressInput.value) address = addressInput.value.trim();

  } else {
    // Helper to get text by exact label span
    function getValueByLabel(labelText) {
      const spans = Array.from(document.querySelectorAll('span.ant-typography'));
      const labelSpan = spans.find(el => el.textContent.trim() === labelText);
      if (labelSpan) {
        const nextEl = labelSpan.nextElementSibling;
        if (nextEl) {
          return nextEl.textContent.trim();
        }
      }
      return '';
    }

    firstName = getValueByLabel('First name');
    lastName = getValueByLabel('Last name');
    phone = getValueByLabel('Phone number');
    email = getValueByLabel('Email');
    address = getValueByLabel('Address');

    const postalCode = getValueByLabel('Postal code');
    const unitNumber = getValueByLabel('Unit number');

    if (address && postalCode) {
      address += `, ${postalCode}`;
    }
    if (address && unitNumber && unitNumber !== '-') {
      address = `Apt ${unitNumber}, ` + address;
    }

    if (!firstName && !lastName) {
      const h3Name = document.querySelector('h3.ant-typography.line-clamp-1');
      if (h3Name) {
        const parts = h3Name.textContent.trim().split(' ');
        if (parts.length > 0) {
          firstName = parts[0];
          if (parts.length > 1) {
            lastName = parts.slice(1).join(' ');
          }
        }
      }
    }
  }

  const hasData = !!(firstName || lastName || phone || email || address);
  return { hasData, firstName, lastName, phone, email, address };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLeadInfo' || request.action === 'manualTrigger') {
    sendResponse(extractLeadInfo());
  }
  return true;
});

let currentInjectedDataStr = '';
let currentInjectedUrl = '';
let isDismissed = false;

function showDetectedPopup(info) {
  if (!info.hasData) {
    const existing = document.getElementById('simon-lead-injected-popup');
    if (existing) existing.remove();
    return;
  }

  const currentUrl = window.location.href;
  if (currentUrl !== currentInjectedUrl) {
    isDismissed = false;
    currentInjectedUrl = currentUrl;
    currentInjectedDataStr = '';
  }

  if (isDismissed) return;

  // Prevent re-rendering if data is identical
  const dataStr = JSON.stringify(info);
  if (currentInjectedDataStr === dataStr) return;
  currentInjectedDataStr = dataStr;

  let container = document.getElementById('simon-lead-injected-popup');
  if (container) container.remove();

  const name = [info.firstName, info.lastName].filter(Boolean).join(' ') || 'Unknown Client';
  
  let detailsHtml = '';
  if (info.phone) detailsHtml += `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px;">📞</span> <span>${info.phone}</span></div>`;
  if (info.email) detailsHtml += `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px;">✉️</span> <span style="word-break: break-all;">${info.email}</span></div>`;
  if (info.address) detailsHtml += `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px;">🏠</span> <span style="line-height: 1.2;">${info.address}</span></div>`;

  container = document.createElement('div');
  container.id = 'simon-lead-injected-popup';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: #080808;
    color: #ffffff;
    border: 1px solid #3c3c3c;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
    z-index: 2147483647;
    font-family: 'IBM Plex Sans', sans-serif;
    padding: 16px;
    box-sizing: border-box;
    animation: simonSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  // Get the logo URL securely
  const logoUrl = chrome.runtime.getURL('128.png');

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
      @keyframes simonSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      #simon-lead-fill-btn:hover { background: #3baabb !important; }
    </style>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #222; padding-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="${logoUrl}" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'">
        <strong style="color: #4abcde; font-size: 14px; font-weight: 600;">Lead Detected!</strong>
      </div>
      <button id="simon-lead-close" style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 18px; padding: 0 4px; line-height: 1;">&times;</button>
    </div>
    
    <div style="margin-bottom: 16px;">
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${name}</div>
      <div style="font-size: 13px; color: #aaa; font-weight: 400; line-height: 1.4;">
        ${detailsHtml}
      </div>
    </div>

    <button id="simon-lead-fill-btn" style="
      background: #4abcde;
      color: #000;
      border: none;
      padding: 10px;
      width: 100%;
      border-radius: 4px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    ">Open Lead Form</button>
  `;

  document.body.appendChild(container);

  document.getElementById('simon-lead-close').addEventListener('click', () => {
    container.style.display = 'none';
    isDismissed = true;
  });

  document.getElementById('simon-lead-fill-btn').addEventListener('click', () => {
    const params = new URLSearchParams();
    if (info.firstName) params.append('firstName', info.firstName);
    if (info.lastName) params.append('lastName', info.lastName);
    if (info.phone) params.append('phone', info.phone);
    if (info.email) params.append('email', info.email);
    if (info.address) params.append('address', info.address);

    const targetUrl = 'https://felixegan.me/lead-form?' + params.toString();
    window.open(targetUrl, '_blank');
    
    // Auto-dismiss after clicking
    container.style.display = 'none';
    isDismissed = true;
  });
}

// Passive detection to update badge quietly in the background
setInterval(() => {
  const isLeadDetails = window.location.href.includes('/lead-details');
  const isPastClient = window.location.href.includes('past-client') || window.location.href.includes('/client-management/');
  const isGetLeadFlow = window.location.hostname === 'app.getleadflow.io' && (window.location.href.includes('/opportunities/') || window.location.href.includes('/location/'));

  if (isLeadDetails || isPastClient || isGetLeadFlow) {
    const info = extractLeadInfo();
    chrome.runtime.sendMessage({ action: 'updateBadge', hasData: info.hasData });
    showDetectedPopup(info);
  } else {
    chrome.runtime.sendMessage({ action: 'updateBadge', hasData: false });
    showDetectedPopup({ hasData: false });
  }
}, 2000);

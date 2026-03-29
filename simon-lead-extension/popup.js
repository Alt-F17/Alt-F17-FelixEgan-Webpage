document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const fillBtn = document.getElementById('fillBtn');
    const manualBtn = document.getElementById('manualBtn');
  
    let currentInfo = null;
  
    function askForInfo(actionName = 'getLeadInfo') {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, { action: actionName }, (response) => {
          if (chrome.runtime.lastError) {
            statusEl.innerHTML = '<span style="color:#ff6464">Not a valid target page or please refresh the tab.</span>';
            fillBtn.disabled = true;
            return;
          }
  
          if (response && response.hasData) {
            currentInfo = response;
            const name = [response.firstName, response.lastName].filter(Boolean).join(' ') || 'Unknown Client';
            statusEl.innerHTML = `<span style="color:#4abcde">Lead detected!</span><br><strong style="color:#fff; font-size: 15px; margin-top:5px; display:inline-block;">${name}</strong>`;
            fillBtn.disabled = false;
          } else {
            statusEl.textContent = 'No lead data currently found on this page.';
            fillBtn.disabled = true;
            currentInfo = null;
          }
        });
      });
    }
  
    fillBtn.addEventListener('click', () => {
      if (!currentInfo) return;
      const params = new URLSearchParams();
      if (currentInfo.firstName) params.append('firstName', currentInfo.firstName);
      if (currentInfo.lastName) params.append('lastName', currentInfo.lastName);
      if (currentInfo.phone) params.append('phone', currentInfo.phone);
      if (currentInfo.email) params.append('email', currentInfo.email);
      if (currentInfo.address) params.append('address', currentInfo.address);
  
      const targetUrl = 'https://felixegan.me/lead-form?' + params.toString();
      chrome.tabs.create({ url: targetUrl });
    });
  
    manualBtn.addEventListener('click', () => {
      statusEl.textContent = 'Force scanning...';
      askForInfo('manualTrigger');
    });
  
    // Initial check when the popup opens
    askForInfo();
  });
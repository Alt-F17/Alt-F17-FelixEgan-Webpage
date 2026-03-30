async function checkLogin() {
    const pwdInput = document.getElementById("password-input").value;
    
    // Simple SHA-256 hash checking to avoid plain-text password in source
    const encoder = new TextEncoder();
    const data = encoder.encode(pwdInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex === "13a9ebc9cfae3764c835558652a41e7e7b2de3c040d517981ee408936306ed1f") {
      document.cookie = "swwc_auth=true; path=/; max-age=31536000"; // 1 year cookie
      document.getElementById("login-overlay").style.display = "none";
    } else {
      alert("Incorrect password");
    }
  }

  // Check auth on load
  document.addEventListener("DOMContentLoaded", () => {
    if (document.cookie.split(';').some((item) => item.trim().startsWith('swwc_auth='))) {
      document.getElementById("login-overlay").style.display = "none";
    }
    renderClients();
  });

  // Handle Enter key for login
  document.getElementById("password-input")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      checkLogin();
    }
  });

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
  }

  function renderClients() {
    const clientList = document.getElementById('client-list');
    let pastClients = JSON.parse(localStorage.getItem('pastClients') || "[]");
    
    // Sort clients so newest are at the top (optional, assuming appended to end)
    pastClients.reverse();

    if (pastClients.length === 0) {
      clientList.innerHTML = "<div style='color: var(--text-color); font-size: 14px;'>No clients saved yet.</div>";
      return;
    }

    clientList.innerHTML = pastClients.map(client => `
      <div class="client-card">
        <div><strong>Name:</strong> ${client.first_name || ''} ${client.last_name || ''}</div>
        <div><strong>Phone:</strong> ${client.phone || ''}</div>
        <div><strong>Email:</strong> ${client.email || ''}</div>
      </div>
    `).join('');
  }

  function saveClient(clientData) {
    if (!clientData.first_name || !clientData.last_name) return; // Need at least a name
    
    let pastClients = JSON.parse(localStorage.getItem('pastClients') || "[]");
    
    // Check if client exists
    const existingIndex = pastClients.findIndex(c => 
      c.first_name.toLowerCase() === clientData.first_name.toLowerCase() && 
      c.last_name.toLowerCase() === clientData.last_name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing client with any new info (merge)
      pastClients[existingIndex] = { ...pastClients[existingIndex], ...clientData };
    } else {
      // Add new client
      pastClients.push(clientData);
    }
    
    localStorage.setItem('pastClients', JSON.stringify(pastClients));
    renderClients(); // Update UI if sidebar is open
  }

  const servicePricing = {
    "Int/Ext Windows": [
      { label: "Small", min: 350, max: 450 },
      { label: "Medium", min: 450, max: 550 },
      { label: "Large 1", min: 550, max: 650 },
      { label: "Large 2", min: 650, max: 750 },
      { label: "XL", min: 800, max: 1200 }
    ],
    "Ext Windows": [
      { label: "Small", min: 200, max: 300 },
      { label: "Medium", min: 250, max: 350 },
      { label: "Large 1", min: 300, max: 350 },
      { label: "Large 2", min: 350, max: 400 },
      { label: "XL", min: 450, max: 650 }
    ],
    "Int Gutters": [
      { label: "Small", min: 200, max: 300 },
      { label: "Medium", min: 250, max: 350 },
      { label: "Large", min: 300, max: 450 },
      { label: "XL", min: 450, max: 550 }
    ],
    "Ext Gutters": [
      { label: "Small", min: 200, max: 300 },
      { label: "Medium", min: 250, max: 350 },
      { label: "Large", min: 300, max: 450 },
      { label: "XL", min: 450, max: 550 }
    ],
    "Soffits": [
      { label: "Small", min: 200, max: 350 },
      { label: "Medium", min: 250, max: 400 },
      { label: "Large", min: 300, max: 450 },
      { label: "XL", min: 450, max: 550 }
    ],
    "Siding Cleaning": [
      { label: "Average Vinyl", min: 325, max: 650 },
      { label: "Range", min: 300, max: 1000 }
    ],
    "Gutter Guards": [
      { label: "Standard", min: 1000, max: 2500 }
    ]
  };

  function updatePriceTemplates() {
    const container = document.getElementById('priceTemplatesContainer');
    container.innerHTML = '';
    
    let activeTemplates = [];
    document.querySelectorAll('.service-chip.selected').forEach(chip => {
      const srv = chip.dataset.value;
      if (servicePricing[srv]) {
        activeTemplates.push({ service: srv, templates: servicePricing[srv] });
      }
    });

    if (activeTemplates.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    
    activeTemplates.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.style.width = '100%';
      groupDiv.style.marginBottom = '6px';
      
      const label = document.createElement('div');
      label.style.fontSize = '12px';
      label.style.fontFamily = "'IBM Plex Mono', monospace";
      label.style.fontWeight = '600';
      label.style.color = 'var(--text)';
      label.style.marginBottom = '6px';
      label.textContent = group.service + " Pricing:";
      groupDiv.appendChild(label);
      
      const chipsDiv = document.createElement('div');
      chipsDiv.style.display = 'flex';
      chipsDiv.style.flexWrap = 'wrap';
      chipsDiv.style.gap = '6px';
      
      group.templates.forEach(t => {
        const btn = document.createElement('div');
        btn.className = 'service-chip';
        btn.style.fontSize = '12px';
        btn.style.fontFamily = "'IBM Plex Mono', monospace";
        btn.style.padding = '4px 8px';
        btn.style.display = 'inline-block';
        btn.style.margin = '0';
        btn.innerText = `${t.label}: $${t.min}-$${t.max}`;
        btn.onclick = () => {
          document.getElementById('customMin').value = t.min;
          document.getElementById('customMax').value = t.max;
        };
        chipsDiv.appendChild(btn);
      });
      
      groupDiv.appendChild(chipsDiv);
      container.appendChild(groupDiv);
    });
  }

  // Service option toggle logic
  document.querySelectorAll('.service-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      
      // Toggle Paver Calculator section visibility based on Polymeric Sanding selection
      if (chip.dataset.value === "Polymeric Sanding") {
        const paverCalcSection = document.getElementById('paverCalcSection');
        if (chip.classList.contains('selected')) {
          paverCalcSection.style.display = 'block';
        } else {
          paverCalcSection.style.display = 'none';
        }
      }

      updatePriceTemplates();
    });
  });

  // Slider logic
  const minSlider = document.getElementById('minSlider');
  const maxSlider = document.getElementById('maxSlider');
  const minDisplay = document.getElementById('minDisplay');
  const maxDisplay = document.getElementById('maxDisplay');
  const sliderFill = document.getElementById('sliderFill');
  const customMin = document.getElementById('customMin');
  const customMax = document.getElementById('customMax');

  function updateSlider() {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);
    if (min > max) { [min, max] = [max, min]; }
    const range = 1000 - 250;
    const leftPct = ((min - 250) / range) * 100;
    const rightPct = ((max - 250) / range) * 100;
    sliderFill.style.left = leftPct + '%';
    sliderFill.style.width = (rightPct - leftPct) + '%';
    minDisplay.textContent = '$' + min;
    maxDisplay.textContent = '$' + max;
    // clear custom if slider used
    customMin.value = '';
    customMax.value = '';
  }

  minSlider.addEventListener('input', updateSlider);
  maxSlider.addEventListener('input', updateSlider);
  updateSlider();

  // Theme toggle
  const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

  function toggleTheme() {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    if (isLight) {
      root.removeAttribute('data-theme');
      icon.innerHTML = sunIcon;
      text.textContent = 'Light Mode';
    } else {
      root.setAttribute('data-theme', 'light');
      icon.innerHTML = moonIcon;
      text.textContent = 'Dark Mode';
    }
  }

  // Simon Button Logic
  let openedFromExtension = false;
  function handleSimonBtn() {
    if (openedFromExtension) {
      window.close(); // Close tab to return to the previous Simon tab
    } else {
      window.open('https://simon.studentworks.com', '_blank');
    }
  }

  // URL Parameters hydration
  function hydrateFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Detect if launched from the extension (URL has payload params)
    if (params.has('firstName') || params.has('phone')) {
      openedFromExtension = true;
      document.getElementById('simonBtnText').textContent = 'New Lead';
      
      // Save client info coming from extension
      const clientData = {
        first_name: params.get('firstName') || '',
        last_name: params.get('lastName') || '',
        phone: params.get('phone') || '',
        email: params.get('email') || '',
        address: params.get('address') || '',
        city: params.get('city') || '',
        zip: params.get('zip') || ''
      };
      saveClient(clientData);
    }

    function setVal(id, param) {
      if (params.has(param)) {
        let val = params.get(param);
        if (val === '-') val = '';
        document.getElementById(id).value = val;
      }
    }
    
    setVal('firstName', 'firstName');
    setVal('lastName', 'lastName');
    setVal('phone', 'phone');
    setVal('email', 'email');
    
    if (params.has('address')) {
      let val = params.get('address');
      if (val === '-') val = '';
      document.getElementById('addressInput').value = val;
      document.getElementById('address').value = val;
    }
  }
  hydrateFromURL();

  // Google Places Autocomplete
  const addressInput = document.getElementById('addressInput');
  const addressHidden = document.getElementById('address');

  function initAutocomplete() {
    let autocomplete = new google.maps.places.Autocomplete(addressInput, {
      componentRestrictions: { country: 'ca' },
      fields: ['formatted_address'],
      types: ['address'],
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(45.41, -73.97),
        new google.maps.LatLng(45.70, -73.47)
      ),
      strictBounds: false
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const addr = place.formatted_address || addressInput.value;
      addressInput.value = addr;
      addressHidden.value = addr;
    });

    addressInput.addEventListener('input', () => {
      addressHidden.value = addressInput.value;
    });

    // Ensure Places API autofill dropdown doesn't persist after clicking off
    addressInput.addEventListener('blur', () => {
      setTimeout(() => {
        document.querySelectorAll('.pac-container').forEach(pac => {
          pac.style.display = 'none';
        });
      }, 200); // slight delay to allow place selection click to register first
    });
  }

  function openInMaps() {
    const addr = addressHidden.value || addressInput.value;
    if (!addr.trim()) return;
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr), '_blank');
  }

  function openInEarth() {
    const addr = addressHidden.value || addressInput.value;
    if (!addr.trim()) return;
    window.open('https://earth.google.com/web/search/' + encodeURIComponent(addr), '_blank');
  }

  function previewStreetView() {
    const addr = addressHidden.value || addressInput.value;
    if (!addr.trim()) return;
    
    const svContainer = document.getElementById('streetViewContainer');
    
    // Toggle container
    if (svContainer.style.display === 'block') {
      svContainer.style.display = 'none';
      return;
    }
    
    svContainer.style.display = 'block';
    svContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted); font-family: \'IBM Plex Mono\', monospace; font-size: 11px;">Loading Street View...</div>';

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': addr }, function(results, status) {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        new google.maps.StreetViewPanorama(svContainer, {
          position: location,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          disableDefaultUI: true,
          showRoadLabels: false,
          linksControl: true,
          panControl: true
        });
      } else {
        svContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted); font-family: \'IBM Plex Mono\', monospace; font-size: 11px;">Could not find Street View for this address. Make sure the address is valid.</div>';
      }
    });
  }


  function getPriceRange() {
    const cMin = document.getElementById('customMin').value.trim();
    const cMax = document.getElementById('customMax').value.trim();
    if (cMin || cMax) {
      const lo = cMin ? '$' + cMin : minDisplay.textContent;
      const hi = cMax ? '$' + cMax : maxDisplay.textContent;
      return lo + ' – ' + hi;
    }
    return minDisplay.textContent + ' – ' + maxDisplay.textContent;
  }

  // --- PAVER CALCULATOR ---
  function calcPavers() {
    const smallArea = parseFloat(document.getElementById('areaSmall').value) || 0;
    const medArea = parseFloat(document.getElementById('areaMed').value) || 0;
    const largeArea = parseFloat(document.getElementById('areaLarge').value) || 0;

    const SumAreas = smallArea + medArea + largeArea;
    document.getElementById('paverTotalArea').textContent = SumAreas;
    document.getElementById('paverTotalAreaAddons').textContent = SumAreas;

    if (SumAreas === 0) {
      document.getElementById('paverTotalPrice').textContent = "$0.00";
      document.getElementById('paverTotalPriceReg').textContent = "$0.00";
      document.getElementById('paverTotalAddonsPrice').textContent = "$0.00";
      document.getElementById('paverTotalAddonsPriceReg').textContent = "$0.00";
      
      document.getElementById('priceSmall').textContent = "-";
      document.getElementById('priceSmallReg').textContent = "-";
      document.getElementById('priceMed').textContent = "-";
      document.getElementById('priceMedReg').textContent = "-";
      document.getElementById('priceLarge').textContent = "-";
      document.getElementById('priceLargeReg').textContent = "-";
      document.getElementById('customMin').value = "";
      document.getElementById('customMax').value = "";
      return;
    }

    const SumHoursPressure = (smallArea/60 + medArea/80 + largeArea/100) + 1;
    const SumHoursSand = (smallArea/125 + medArea/150 + largeArea/175) + 1;
    const SumHoursSealEff = (SumAreas/200 + SumAreas/400) + 1;
    const SumHoursWeed = SumAreas/300;
    const SumHoursIns = SumAreas/300;

    const CostG2Maxx = Math.ceil(SumAreas/65) * 42;
    const CostSupersand = Math.ceil(SumAreas/65) * 25;
    const CostSealant = (SumAreas/200) * 85;
    const CostEfflor = (SumAreas/300) * 45;
    const CostIns = Math.ceil(SumAreas/1000) * 38;
    const CostWeed = Math.ceil(SumAreas/1000) * 35;

    const isG2 = document.getElementById('sand-g2').checked;
    
    let basePrice = 0;
    if (isG2) {
      basePrice = ((SumHoursPressure + SumHoursSand)*90 + CostG2Maxx/0.41);
    } else {
      basePrice = ((SumHoursPressure + SumHoursSand)*90 + CostSupersand/0.41);
    }

    let addonsPrice = 0;
    if (document.getElementById('chkSealEff').checked) {
      addonsPrice += ((SumHoursSealEff)*90 + (CostSealant + CostEfflor)/0.41);
    }
    if (document.getElementById('chkIns').checked) {
      addonsPrice += (SumHoursIns*90 + CostIns/0.41);
    }
    if (document.getElementById('chkWeed').checked) {
      addonsPrice += (SumHoursWeed*90 + CostWeed/0.41);
    }

    const baseReg = basePrice / 0.9;
    const addonsReg = (basePrice + addonsPrice) / 0.9;

    document.getElementById('paverTotalPrice').textContent = "$" + Math.round(basePrice);
    document.getElementById('paverTotalPriceReg').textContent = "$" + Math.ceil(baseReg);
    document.getElementById('paverTotalAddonsPrice').textContent = "$" + Math.round(basePrice + addonsPrice);
    document.getElementById('paverTotalAddonsPriceReg').textContent = "$" + Math.ceil(addonsReg);

    // Auto-update custom price range directly from Paver Calculator
    document.getElementById('customMin').value = Math.round(basePrice + addonsPrice);
    document.getElementById('customMax').value = Math.ceil(addonsReg);

    // Calculate individual row prices based on proportion of total area
    if (smallArea > 0) {
      const ratio = smallArea / SumAreas;
      document.getElementById('priceSmall').textContent = "$" + Math.round(basePrice * ratio);
      document.getElementById('priceSmallReg').textContent = "$" + Math.ceil(baseReg * ratio);
    } else {
      document.getElementById('priceSmall').textContent = "-";
      document.getElementById('priceSmallReg').textContent = "-";
    }

    if (medArea > 0) {
      const ratio = medArea / SumAreas;
      document.getElementById('priceMed').textContent = "$" + Math.round(basePrice * ratio);
      document.getElementById('priceMedReg').textContent = "$" + Math.ceil(baseReg * ratio);
    } else {
      document.getElementById('priceMed').textContent = "-";
      document.getElementById('priceMedReg').textContent = "-";
    }

    if (largeArea > 0) {
      const ratio = largeArea / SumAreas;
      document.getElementById('priceLarge').textContent = "$" + Math.round(basePrice * ratio);
      document.getElementById('priceLargeReg').textContent = "$" + Math.ceil(baseReg * ratio);
    } else {
      document.getElementById('priceLarge').textContent = "-";
      document.getElementById('priceLargeReg').textContent = "-";
    }
  }

  // --- CALENDAR LOGIC (OAuth 2.0) ---
  const CALENDAR_IDS = [
    'd202e4eaa609e358be0a68a1020a0a78f043b3258dc1f53bdc19684326b1c7bd@group.calendar.google.com',
    '5u0rransmq3ng6utve230g5um0@group.calendar.google.com' // Replace with your shared calendar IDs
  ];
  
  // You MUST create an OAuth 2.0 Client ID in Google Cloud Console
  // Authorized JavaScript origins must include: https://felixegan.me
  const CLIENT_ID = '645892232656-8m0uup2rn2jjcj0r1mf6ttrvhr46bp5h.apps.googleusercontent.com';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;
  let isAuthenticated = false;

  // Initialize the API client library
  function gapiLoaded() {
    gapi.load('client', intializeGapiClient);
  }

  async function intializeGapiClient() {
    await gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    checkAuthStatus();
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined below
    });
    gisInited = true;
    checkAuthStatus();
  }

  function checkAuthStatus() {
    if (gapiInited && gisInited) {
      // Show auth button, ready to click
      document.getElementById('authBtn').style.display = 'block';
      checkExistingToken(); // Try to auto-connect using saved token
    }
  }

  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      
      // Save token to localStorage with expiration
      const tokenData = {
        access_token: resp.access_token,
        expires_at: Date.now() + (resp.expires_in * 1000)
      };
      localStorage.setItem('google_calendar_token', JSON.stringify(tokenData));
      
      setAuthUI();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select an account.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser.
      tokenClient.requestAccessToken({prompt: ''});
    }
  }

  function checkExistingToken() {
    const rawData = localStorage.getItem('google_calendar_token');
    if (rawData) {
      try {
        const tokenData = JSON.parse(rawData);
        // Check if token is still valid (add 5 min buffer)
        if (Date.now() < (tokenData.expires_at - 300000)) {
          gapi.client.setToken({ access_token: tokenData.access_token });
          setAuthUI();
        } else {
          localStorage.removeItem('google_calendar_token'); // expired
        }
      } catch (e) {
        localStorage.removeItem('google_calendar_token');
      }
    }
  }

  function setAuthUI() {
    isAuthenticated = true;
    const btn = document.getElementById('authBtn');
    btn.textContent = 'Calendar Connected';
    btn.style.background = 'var(--accent)';
    btn.style.color = '#000';
    if (selectedDateStr) renderTimeSlots(selectedDateStr); // Refresh times if date already selected
  }

  let currentDate = new Date();
  
  // Find if there are any weekends left in this month
  (function autoAdvanceMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let pastAllWeekends = true;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isWeekend = (d.getDay() === 0 || d.getDay() === 6);
      if (isWeekend) {
        // Also apply the Thursday cutoff logic (same as renderCalendar)
        let isBlocked = false;
        const thurs = new Date(d);
        thurs.setDate(d.getDate() - (d.getDay() === 6 ? 2 : 3));
        if (today >= thurs) isBlocked = true;
        
        let isPast = d < today || isBlocked;
        if (!isPast) {
          pastAllWeekends = false;
          break;
        }
      }
    }
    if (pastAllWeekends) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  })();
  
  currentDate.setDate(1); // Start of current month
  let selectedDateStr = null;
  let selectedTimeStr = null;

  const monthLabel = document.getElementById('monthLabel');
  const calendarDays = document.getElementById('calendarDays');
  const timeSlotsContainer = document.getElementById('timeSlotsContainer');
  const timeSlotsGrid = document.getElementById('timeSlotsGrid');

  function renderCalendar() {
    const satCol = document.getElementById('satCol');
    const sunCol = document.getElementById('sunCol');
    
    // Clear previous except headers
    satCol.innerHTML = '<div class="weekend-header-day">SAT</div>';
    sunCol.innerHTML = '<div class="weekend-header-day">SUN</div>';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set Header
    const dateOpts = { month: 'long', year: 'numeric' };
    monthLabel.textContent = currentDate.toLocaleDateString('en-US', dateOpts);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(year, month, i).getDay();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      
      if (!isWeekend) continue;

      const dayDiv = document.createElement('div');
      dayDiv.className = 'time-slot';
      dayDiv.textContent = i;
      
      // Determine if past day or blocked by Thursday cutoff
      const thisDate = new Date(year, month, i);
      thisDate.setHours(23, 59, 59, 999);
      const isPast = thisDate < today;

      let isBlockedByThursdayCutoff = false;
      const todayDateObj = new Date();
      todayDateObj.setHours(0, 0, 0, 0);

      // Find the Thursday of this the week for `thisDate` (Saturday=6, Sunday=0)
      const thursdayOfThisWeek = new Date(thisDate);
      thursdayOfThisWeek.setDate(thisDate.getDate() - (thisDate.getDay() === 6 ? 2 : 3));
      thursdayOfThisWeek.setHours(0, 0, 0, 0);

      if (todayDateObj >= thursdayOfThisWeek) {
        isBlockedByThursdayCutoff = true;
      }

      if (isPast) { // add `|| isBlockedByThursdayCutoff` to cut next weekends
        dayDiv.classList.add('booked'); // visually disabled
      } else {
        dayDiv.classList.add('available');
        
        let mStr = (month + 1).toString().padStart(2, '0');
        let dStr = i.toString().padStart(2, '0');
        let yStr = year;
        let dateId = `${yStr}-${mStr}-${dStr}`;

        if (dateId === selectedDateStr) {
          dayDiv.classList.add('selected');
        }

        if (thisDate.toDateString() === today.toDateString()) {
          dayDiv.classList.add('today'); // Optional, add later if needed
        }

        dayDiv.addEventListener('click', () => {
          // Clear custom inputs
          document.getElementById('customDateInput').value = '';
          document.getElementById('customTimeInput').value = '';

          // Clear selected visual from days
          satCol.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
          sunCol.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
          
          dayDiv.classList.add('selected');
          selectedDateStr = dateId;
          selectedTimeStr = null; // Reset time

          renderTimeSlots(dateId);
        });
      }
      
      if (dayOfWeek === 6) {
        satCol.appendChild(dayDiv);
      } else if (dayOfWeek === 0) {
        sunCol.appendChild(dayDiv);
      }
    }
  }

  function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
    selectedDateStr = null;
    selectedTimeStr = null;
    renderEmptyTimeSlots();
  }

  function renderEmptyTimeSlots() {
    // Hide the time slots container entirely instead of showing empty ones
    document.getElementById('timeSlotsContainer').style.display = 'none';
    timeSlotsGrid.innerHTML = '';
  }

  async function renderTimeSlots(dateId) {
    timeSlotsContainer.style.display = 'block';
    timeSlotsGrid.innerHTML = '<div class="time-slot-loading">Checking availability...</div>';

    // Time blocks: 9 AM to 5 PM
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    let events = [];

    // Attempt to fetch from Google Calendars if configured
    try {
      const timeMin = new Date(`${dateId}T00:00:00`).toISOString();
      const timeMax = new Date(`${dateId}T23:59:59`).toISOString();
      
      if (!isAuthenticated) {
        timeSlotsGrid.innerHTML = '<div class="time-slot-loading">Please connect calendar...</div>';
        return;
      }
      
      const fetchPromises = CALENDAR_IDS.map(async (calId) => {
        if (!calId || calId.includes('shared_calendar_id')) return [];
        try {
          const response = await gapi.client.calendar.events.list({
            'calendarId': calId,
            'timeMin': timeMin,
            'timeMax': timeMax,
            'showDeleted': false,
            'singleEvents': true,
            'orderBy': 'startTime',
          });
          return response.result.items || [];
        } catch (err) {
          console.error(`Failed to fetch calendar ${calId}`, err);
          return [];
        }
      });

      const allEventsArrays = await Promise.all(fetchPromises);
      events = allEventsArrays.flat(); // Merge events from all calendars
    } catch (err) {
      console.error('Error fetching calendars', err);
      // Remove bad token if auth error
      if (err.status === 401 || err.status === 403) {
         localStorage.removeItem('google_calendar_token');
         isAuthenticated = false;
         document.getElementById('authBtn').textContent = 'Connect Calendar';
         document.getElementById('authBtn').style.background = 'var(--surface)';
         document.getElementById('authBtn').style.color = 'var(--accent)';
      }
    }

    timeSlotsGrid.innerHTML = '';
    
    hours.forEach(hour => {
      // Check if this hour overlaps with any event
      const slotStart = new Date(`${dateId}T${hour.toString().padStart(2, '0')}:00:00`);
      const slotEnd = new Date(`${dateId}T${(hour + 1).toString().padStart(2, '0')}:00:00`);

      let isBooked = false;
      for (const ev of events) {
        const evStart = new Date(ev.start.dateTime || ev.start.date);
        const evEnd = new Date(ev.end.dateTime || ev.end.date);
        // Overlap condition: start1 < end2 AND end1 > start2
        if (slotStart < evEnd && slotEnd > evStart) {
          isBooked = true;
          break;
        }
      }

      // Format hour (e.g. 9 AM)
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let hr12 = hour % 12;
      if (hr12 === 0) hr12 = 12;
      const timeLabel = `${hr12}:00 ${ampm}`;

      const slotDiv = document.createElement('div');
      slotDiv.className = 'time-slot';
      slotDiv.textContent = timeLabel;
      
      if (isBooked) {
        slotDiv.classList.add('booked');
      } else {
        slotDiv.classList.add('available');
        slotDiv.addEventListener('click', () => {
          timeSlotsGrid.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
          slotDiv.classList.add('selected');
          selectedTimeStr = timeLabel;
        });
      }
      
      timeSlotsGrid.appendChild(slotDiv);
    });
  }

  function handleCustomDateTime() {
    const customDate = document.getElementById('customDateInput').value;
    const customTimeRaw = document.getElementById('customTimeInput').value;
    
    // Clear selection on the weekend calendar
    document.getElementById('satCol').querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
    document.getElementById('sunCol').querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
    
    const timeSlotsGrid = document.getElementById('timeSlotsGrid');
    
    if (customDate) {
      selectedDateStr = customDate;
      timeSlotsGrid.innerHTML = '<div class="time-slot-loading" style="color: var(--muted);">Custom Date Selected</div>';
    } else {
      selectedDateStr = null;
      renderEmptyTimeSlots();
    }
    
    if (customTimeRaw) {
      // Convert 24h to 12h for consistency
      let [hour, minute] = customTimeRaw.split(':');
      hour = parseInt(hour, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let hour12 = hour % 12;
      if (hour12 === 0) hour12 = 12;
      selectedTimeStr = `${hour12}:${minute} ${ampm}`;
    } else {
      selectedTimeStr = null;
    }
  }

  // Initialize Calendar
  renderCalendar();
  renderEmptyTimeSlots();
  // --- END CALENDAR LOGIC ---

  function generate() {
    const first = document.getElementById('firstName').value.trim() || '—';
    const last = document.getElementById('lastName').value.trim() || '—';
    const phone = document.getElementById('phone').value.trim() || '—';
    const email = document.getElementById('email').value.trim() || '—';
    const address = (addressHidden.value || addressInput.value).trim() || '—';
    const notes = document.getElementById('notes').value.trim();

    const selectedChips = Array.from(document.querySelectorAll('.service-chip.selected'));
    const selected = selectedChips.map(c => c.getAttribute('data-value'));
    const service = selected.length ? selected.join(', ') : '—';

    const pr = getPriceRange();

    const dm = document.querySelector('input[name="dm"]:checked').value;
    const ten = document.querySelector('input[name="ten"]:checked').value;
    
    // Format Date & Time
    let appointment = '—';
    const bookBtn = document.getElementById('bookEstimateBtn');
    
    if (selectedDateStr && selectedTimeStr) {
      appointment = `${selectedDateStr} @ ${selectedTimeStr}`;
      const [y, m, d] = selectedDateStr.split('-');
      bookBtn.textContent = `Book Estimate On: ${d}/${m}/${y} at ${selectedTimeStr}`;
      bookBtn.style.display = 'block';
    } else if (selectedDateStr) {
      appointment = `${selectedDateStr} (Time not selected)`;
      bookBtn.style.display = 'none';
    } else {
      bookBtn.style.display = 'none';
    }

    const out =
`Name: ${first} ${last}
Phone Number: ${phone}
Email: ${email}
Address: ${address}
---
Service: ${service}
PR: ${pr}
DM? ${dm}
10%? ${ten}` + (notes ? `\n---\nNotes:\n${notes}` : '');

    document.getElementById('output').value = out;
  }

  function callPhone() {
    const phoneNumber = document.getElementById('phone').value.trim();
    if (phoneNumber && phoneNumber !== '—') {
      window.location.href = 'tel:' + encodeURIComponent(phoneNumber);
    }
  }

  function bookEstimate() {
    if (!selectedDateStr || !selectedTimeStr) return;

    const details = document.getElementById('output').value.trim();
    const bookBtn = document.getElementById('bookEstimateBtn');
    
    // Validation: make sure they generated the output first
    if (!details) {
      const originalText = bookBtn.textContent;
      bookBtn.textContent = 'Generate Output First!';
      bookBtn.style.color = 'var(--danger)';
      bookBtn.style.borderColor = 'var(--danger)';
      setTimeout(() => {
        bookBtn.textContent = originalText;
        bookBtn.style.color = '';
        bookBtn.style.borderColor = '';
      }, 2000);
      return;
    }

    // Set the specific calendar ID to post the new event to. 
    // If left empty or null, it opens the default primary calendar.
    const TARGET_CALENDAR_ID = 'd202e4eaa609e358be0a68a1020a0a78f043b3258dc1f53bdc19684326b1c7bd@group.calendar.google.com'; 

    const [year, month, day] = selectedDateStr.split('-');
    
    const timeParts = selectedTimeStr.split(' ');
    const [hourStr, minStr] = timeParts[0].split(':');
    let hour = parseInt(hourStr);
    if (timeParts[1] === 'PM' && hour !== 12) hour += 12;
    if (timeParts[1] === 'AM' && hour === 12) hour = 0;
    
    const startObj = new Date(year, parseInt(month) - 1, day, hour, parseInt(minStr));
    const endObj = new Date(startObj.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatTime = (d) => {
      const pad = (n) => n.toString().padStart(2, '0');
      // Format as YYYYMMDDTHHMMSS (local time, let Google interpret based on user's timezone)
      return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    };
    
    const dates = `${formatTime(startObj)}/${formatTime(endObj)}`;
    const address = (addressHidden.value || addressInput.value).trim();
    const first = document.getElementById('firstName').value.trim() || 'Client';
    const last = document.getElementById('lastName').value.trim() || '';
    
    const title = `Estimate: ${first} ${last}`;
    
    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(address)}`;
    
    // Append the target calendar ID if configured
    if (TARGET_CALENDAR_ID) {
      url += `&src=${encodeURIComponent(TARGET_CALENDAR_ID)}`;
    }
    
    window.open(url, '_blank');
  }

  function copyOutput() {
    const ta = document.getElementById('output');
    ta.select();
    ta.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(ta.value).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy to Clipboard';
        btn.classList.remove('copied');
      }, 1800);
    });
  }

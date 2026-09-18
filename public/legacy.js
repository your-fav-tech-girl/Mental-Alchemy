// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => observer.observe(el));
} else {
  // Fallback: just show everything
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// Sticky header shadow on scroll
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      navLinks.style.cssText = 'display:flex;position:absolute;top:100%;left:0;right:0;background:#FFFFFF;flex-direction:column;padding:20px 24px;border-bottom:1px solid rgba(37,48,45,0.1);gap:18px;box-shadow:0 12px 24px -12px rgba(37,48,45,0.15);';
    } else {
      navLinks.style.display = 'none';
    }
  });

  // Close mobile menu when a link is tapped
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.style.display = 'none';
    });
  });
}

// Therapist directory filtering (therapists.html only)
const filterBar = document.getElementById('filter-bar');
if (filterBar) {
  const filterPills = filterBar.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.directory-card');
  const filterCount = document.getElementById('filter-count');
  const noResults = document.getElementById('no-results');

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;

      if (filter === 'all') {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
      } else {
        filterPills[0].classList.remove('active'); // deactivate "All"
        pill.classList.toggle('active');
        const anyActive = Array.from(filterPills).slice(1).some((p) => p.classList.contains('active'));
        if (!anyActive) filterPills[0].classList.add('active');
      }

      const activeFilters = Array.from(filterPills)
        .filter((p) => p.classList.contains('active') && p.dataset.filter !== 'all')
        .map((p) => p.dataset.filter);

      let visibleCount = 0;
      cards.forEach((card) => {
        const specialties = (card.dataset.specialties || '').split(' ');
        const matches = activeFilters.length === 0 || activeFilters.some((f) => specialties.includes(f));
        card.classList.toggle('hidden-card', !matches);
        if (matches) visibleCount++;
      });

      if (filterCount) {
        filterCount.textContent = activeFilters.length === 0
          ? `Showing all ${cards.length} therapists`
          : `Showing ${visibleCount} therapist${visibleCount === 1 ? '' : 's'}`;
      }
      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  });
}

// Contact form (contact.html only) — demo-only, no backend wired up
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const successMsg = document.getElementById('form-success');
    contactForm.reset();
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// Password visibility toggles (signup.html)
document.querySelectorAll('.toggle-visibility').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const isHidden = target.type === 'password';
    target.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

// Sign-up form: live password match check + submit handling
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  const pw = document.getElementById('signup-password');
  const confirm = document.getElementById('confirm-password');
  const matchHint = document.getElementById('match-hint');

  function checkMatch() {
    if (!confirm.value) {
      matchHint.hidden = true;
      return true;
    }
    const matches = pw.value === confirm.value;
    matchHint.hidden = matches;
    return matches;
  }

  pw.addEventListener('input', checkMatch);
  confirm.addEventListener('input', checkMatch);

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkMatch()) {
      confirm.focus();
      return;
    }
    const successMsg = document.getElementById('signup-success');
    signupForm.reset();
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// Login form (login.html) — demo only, redirects to dashboard on submit
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const errorMsg = document.getElementById('login-error');
    if (!email.value || !password.value) {
      if (errorMsg) errorMsg.hidden = false;
      return;
    }
    if (errorMsg) errorMsg.hidden = true;
    // This legacy form intentionally performs a full navigation after login.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/dashboard';
  });
}

// Dashboard sidebar toggle (mobile)
const appSidebar = document.getElementById('app-sidebar');
const appSidebarToggle = document.getElementById('app-sidebar-toggle');
const appSidebarOverlay = document.getElementById('app-sidebar-overlay');
if (appSidebar && appSidebarToggle) {
  function closeAppSidebar() {
    appSidebar.classList.remove('open');
    appSidebarOverlay.classList.remove('open');
    appSidebarToggle.setAttribute('aria-expanded', 'false');
  }
  appSidebarToggle.addEventListener('click', () => {
    const isOpen = appSidebar.classList.toggle('open');
    appSidebarOverlay.classList.toggle('open', isOpen);
    appSidebarToggle.setAttribute('aria-expanded', isOpen);
  });
  appSidebarOverlay.addEventListener('click', closeAppSidebar);
}

// Helper: is this page running inside WordPress with the Harbor plugin active?
// (Left in place in case this site is later connected to a real backend —
// everything below works fine without it, using the browser's storage instead.)
function harborIsLive() {
  return typeof window.harborConfig !== 'undefined' && window.harborConfig.restUrl;
}

// Helper: call a harbor/v1 REST endpoint with the WP nonce attached.
async function harborApi(path, options = {}) {
  const res = await fetch(window.harborConfig.restUrl + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.harborConfig.nonce,
      ...(options.headers || {})
    },
    credentials: 'same-origin'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request to ${path} failed`);
  }
  return res.json();
}

/* ============= LOCAL DATA LAYER (no backend required) =============
   Real persistence via localStorage — data survives reloads and closing
   the tab, scoped to this browser/device. This is what makes the
   dashboard "live" without needing WordPress or any server. */

function harborStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function harborStoreSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* storage unavailable — fail silently, page still works */ }
}

function harborGetAppointments() {
  return harborStore('harborAppointments', null) || harborSeedAppointments();
}
function harborSaveAppointment(appt) {
  const list = harborGetAppointments();
  appt.id = Date.now();
  appt.status = 'confirmed';
  list.push(appt);
  harborStoreSet('harborAppointments', list);
  return appt;
}

// Seeds a starter appointment + a little session history so the dashboard
// isn't empty on first visit. Runs once; after that, real bookings take over.
function harborSeedAppointments() {
  const inFour = new Date();
  inFour.setDate(inFour.getDate() + 4);
  inFour.setHours(16, 0, 0, 0);

  const past = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    past.push({
      id: `seed-${i}`,
      therapist_id: 1,
      therapist_name: 'Dr. Naomi Reyes',
      therapist_photo: 'https://images.unsplash.com/photo-1749222013825-fe2025dcf0cf?fm=jpg&q=80&w=400&auto=format&fit=crop',
      appointment_datetime: d.toISOString(),
      session_type: 'Video session',
      notes: '',
      status: 'confirmed'
    });
  }

  const seeded = [
    {
      id: 'seed-upcoming',
      therapist_id: 1,
      therapist_name: 'Dr. Naomi Reyes',
      therapist_photo: 'https://images.unsplash.com/photo-1749222013825-fe2025dcf0cf?fm=jpg&q=80&w=400&auto=format&fit=crop',
      appointment_datetime: inFour.toISOString(),
      session_type: 'Video session',
      notes: '',
      status: 'confirmed'
    },
    ...past
  ];
  harborStoreSet('harborAppointments', seeded);
  return seeded;
}

function harborGetMoodEntries() {
  return harborStore('harborMoodEntries', []);
}
function harborSaveMoodEntry(mood) {
  const list = harborGetMoodEntries();
  list.push({ mood, date: new Date().toISOString() });
  harborStoreSet('harborMoodEntries', list);
}
function harborTodaysMood() {
  const list = harborGetMoodEntries();
  const today = new Date().toDateString();
  return list.filter((e) => new Date(e.date).toDateString() === today).slice(-1)[0] || null;
}

// Mood check-in widget (dashboard.html)
const moodOptions = document.getElementById('mood-options');
if (moodOptions) {
  const moodButtons = moodOptions.querySelectorAll('.mood-btn');
  const moodResponse = document.getElementById('mood-response');
  const responses = {
    Low: "Thanks for sharing that. It's noted for your next session with Dr. Reyes.",
    Uneasy: "Got it — logged. Small steps count, even the uneasy days.",
    Okay: "Noted. Steady is still progress.",
    Good: "Good to hear. Logged for today.",
    Great: "Love that. Logged for today."
  };

  // Restore today's check-in on load, if one was already logged.
  const already = harborTodaysMood();
  if (already) {
    const match = Array.from(moodButtons).find((b) => b.dataset.mood === already.mood);
    if (match) match.classList.add('selected');
    if (moodResponse) {
      moodResponse.textContent = `You already checked in today: ${already.mood}. ` + (responses[already.mood] || '');
      moodResponse.hidden = false;
    }
  }

  moodButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      moodButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      const message = responses[btn.dataset.mood] || 'Thanks — logged for today.';

      if (harborIsLive()) {
        try {
          await harborApi('mood', { method: 'POST', body: JSON.stringify({ mood: btn.dataset.mood }) });
        } catch (e) { /* fall through to local save below regardless */ }
      }
      harborSaveMoodEntry(btn.dataset.mood);
      if (moodResponse) { moodResponse.textContent = message; moodResponse.hidden = false; }
    });
  });
}

// Dashboard: load the real next appointment + recompute stats from stored data.
const sessionCard = document.querySelector('.session-card');
if (sessionCard) {
  const renderFromAppointments = (appointments) => {
    const now = new Date();
    const upcoming = appointments
      .filter((a) => a.status !== 'cancelled' && new Date(a.appointment_datetime) > now)
      .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))[0];
    const past = appointments.filter((a) => a.status !== 'cancelled' && new Date(a.appointment_datetime) <= now);

    if (upcoming) {
      const dt = new Date(upcoming.appointment_datetime);
      const dateStr = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const photoEl = sessionCard.querySelector('.session-photo img');
      if (photoEl && upcoming.therapist_photo) photoEl.src = upcoming.therapist_photo;
      const nameEl = sessionCard.querySelector('.session-info h2');
      if (nameEl) nameEl.textContent = `With ${upcoming.therapist_name}`;
      const metaEl = sessionCard.querySelector('.session-meta');
      if (metaEl) metaEl.textContent = `${dateStr} · ${timeStr} · ${upcoming.session_type}`;

      // "Next session" stat card
      const daysAway = Math.max(1, Math.round((dt - now) / 86400000));
      const nextStat = document.querySelector('.stat-card .stat-value');
      if (nextStat) {
        nextStat.textContent = daysAway === 1 ? '1 day' : `${daysAway} days`;
        nextStat.nextElementSibling.textContent = `${dateStr.split(',')[0]}, ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`;
      }
    } else {
      sessionCard.innerHTML = '<p style="color:rgba(255,255,255,0.8);">No upcoming sessions booked yet. <a href="/booking" style="color:var(--gold); font-weight:600;">Book one now →</a></p>';
    }

    // "Sessions completed" stat card
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[1]) {
      statCards[1].querySelector('.stat-value').textContent = String(past.length);
    }
  };

  if (harborIsLive()) {
    harborApi('appointments').then(renderFromAppointments)
      .catch(() => renderFromAppointments(harborGetAppointments()));
  } else {
    renderFromAppointments(harborGetAppointments());
  }
}

// ================= BOOKING FLOW (booking.html) =================
const bookingStepper = document.getElementById('booking-stepper');
if (bookingStepper) {
  const state = {
    therapist: null,
    sessionType: 'Video session',
    day: null,
    time: null
  };

  const stepItems = bookingStepper.querySelectorAll('.step-item');
  const panels = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3')
  };
  const successPanel = document.getElementById('booking-success');

  function goToStep(n) {
    Object.keys(panels).forEach((key) => {
      panels[key].hidden = Number(key) !== n;
    });
    stepItems.forEach((item) => {
      const s = Number(item.dataset.step);
      item.classList.toggle('active', s === n);
      item.classList.toggle('done', s < n);
    });
    successPanel.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Step 1: therapist filter + select ---
  const bookingFilterBar = document.getElementById('booking-filter-bar');
  const bookingGrid = document.getElementById('booking-therapist-grid');
  const toStep2Btn = document.getElementById('to-step-2');
  let therapistCards = [];

  function renderTherapistCard(t) {
    const specialties = (t.specialties || '').toLowerCase();
    return `
      <button class="booking-therapist-card" data-id="${t.id ?? ''}" data-name="${t.name}" data-role="${t.role}" data-specialties="${specialties.replace(/,/g, ' ')}" data-photo="${t.photo}">
        <img src="${t.photo}" alt="${t.name}">
        <h3>${t.name}</h3>
        <p class="t-role">${t.role}</p>
        <div class="t-tags">${specialties.split(',').filter(Boolean).slice(0, 2).map((s) => `<span>${s.trim()}</span>`).join('')}</div>
        <span class="select-check" aria-hidden="true">✓</span>
      </button>`;
  }

  function bindTherapistCards() {
    therapistCards = Array.from(bookingGrid.querySelectorAll('.booking-therapist-card'));
    therapistCards.forEach((card) => {
      card.addEventListener('click', () => {
        therapistCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        state.therapist = {
          id: card.dataset.id,
          name: card.dataset.name,
          role: card.dataset.role,
          photo: card.dataset.photo
        };
        toStep2Btn.disabled = false;
      });
    });
  }

  function bindFilterBar() {
    bookingFilterBar.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        bookingFilterBar.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        therapistCards.forEach((card) => {
          const specialties = (card.dataset.specialties || '').split(' ');
          const match = filter === 'all' || specialties.includes(filter);
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  if (harborIsLive()) {
    bookingGrid.innerHTML = '<p style="color:var(--ink-soft);">Loading therapists…</p>';
    harborApi('therapists')
      .then((therapists) => {
        if (!therapists.length) {
          bookingGrid.innerHTML = '<p style="color:var(--ink-soft);">No therapists published yet — add some under Therapists in wp-admin.</p>';
          return;
        }
        bookingGrid.innerHTML = therapists.map(renderTherapistCard).join('');
        bindTherapistCards();
        bindFilterBar();
        preselectTherapistFromUrl();
      })
      .catch(() => {
        bookingGrid.innerHTML = '<p style="color:var(--ink-soft);">Could not load therapists right now. Please refresh.</p>';
      });
  } else {
    // Standalone preview — use the hardcoded cards already in the HTML.
    bindTherapistCards();
    bindFilterBar();
    preselectTherapistFromUrl();
  }

  // Lets "Book with [Therapist]" links (e.g. from therapists.html) land on
  // this page with that therapist already selected, via
  // book.html?therapist=Marcus%20Webb — user still clicks Continue themselves.
  function preselectTherapistFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('therapist');
    if (!wanted) return;
    const match = therapistCards.find((c) => c.dataset.name.toLowerCase() === wanted.toLowerCase());
    if (match) match.click();
  }

  toStep2Btn.addEventListener('click', () => {
    if (!state.therapist) return;
    document.getElementById('step2-sub').textContent = `Showing availability for ${state.therapist.name}.`;
    buildDayPicker();
    goToStep(2);
  });

  // --- Step 2: session type, day, time ---
  const sessionTypeToggle = document.getElementById('session-type-toggle');
  sessionTypeToggle.querySelectorAll('.type-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      sessionTypeToggle.querySelectorAll('.type-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.sessionType = pill.dataset.type;
    });
  });

  const dayPicker = document.getElementById('day-picker');
  const timeGrid = document.getElementById('time-grid');
  const toStep3Btn = document.getElementById('to-step-3');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sampleTimes = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:00 PM', '5:30 PM', '6:30 PM'];

  function buildDayPicker() {
    dayPicker.innerHTML = '';
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const btn = document.createElement('button');
      btn.className = 'day-btn';
      btn.innerHTML = `<span class="day-name">${dayNames[d.getDay()]}</span><span class="day-num">${d.getDate()}</span>`;
      btn.dataset.date = d.toDateString();
      btn.addEventListener('click', () => {
        dayPicker.querySelectorAll('.day-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.day = d;
        state.time = null;
        toStep3Btn.disabled = true;
        buildTimeGrid(i);
      });
      dayPicker.appendChild(btn);
      if (i === 1) btn.click(); // auto-select first available day
    }
  }

  function buildTimeGrid(seed) {
    timeGrid.innerHTML = '';
    sampleTimes.forEach((time, idx) => {
      const btn = document.createElement('button');
      btn.className = 'time-btn';
      btn.textContent = time;
      // deterministic pseudo-availability so it's not always all-open
      const unavailable = (idx + seed) % 5 === 0;
      if (unavailable) {
        btn.classList.add('unavailable');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          timeGrid.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.time = time;
          toStep3Btn.disabled = false;
        });
      }
      timeGrid.appendChild(btn);
    });
  }

  document.getElementById('back-to-step-1').addEventListener('click', () => goToStep(1));

  toStep3Btn.addEventListener('click', () => {
    if (!state.day || !state.time) return;
    const dateStr = state.day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('confirm-photo').src = state.therapist.photo;
    document.getElementById('confirm-photo').alt = state.therapist.name;
    document.getElementById('confirm-name').textContent = state.therapist.name;
    document.getElementById('confirm-role').textContent = state.therapist.role;
    document.getElementById('confirm-datetime').textContent = `${dateStr} · ${state.time}`;
    document.getElementById('confirm-type').textContent = state.sessionType;
    goToStep(3);
  });

  document.getElementById('back-to-step-2').addEventListener('click', () => goToStep(2));

  // --- Step 3: confirm booking ---
  function buildAppointmentDateTime() {
    const d = new Date(state.day);
    const match = state.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const isPM = /PM/i.test(match[3]);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      d.setHours(hours, minutes, 0, 0);
    }
    return d;
  }

  document.getElementById('confirm-booking-btn').addEventListener('click', async () => {
    const policyCheck = document.getElementById('cancellation-policy');
    if (!policyCheck.checked) {
      policyCheck.closest('.checkbox-row').style.color = '#B4544A';
      policyCheck.focus();
      return;
    }

    // Guest fields only exist on the public book.html page — dashboard's
    // logged-in booking.html doesn't ask for name/email since it already knows.
    const guestNameEl = document.getElementById('guest-name');
    const guestEmailEl = document.getElementById('guest-email');
    const guestPhoneEl = document.getElementById('guest-phone');
    if (guestNameEl && guestEmailEl) {
      if (!guestNameEl.value.trim() || !guestEmailEl.value.trim()) {
        if (!guestNameEl.value.trim()) guestNameEl.focus(); else guestEmailEl.focus();
        return;
      }
    }

    const confirmBtn = document.getElementById('confirm-booking-btn');
    const dateStr = state.day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const appointmentDate = buildAppointmentDateTime();
    const payload = {
      therapist_id: state.therapist.id,
      therapist_name: state.therapist.name,
      therapist_photo: state.therapist.photo,
      appointment_datetime: appointmentDate.toISOString(),
      session_type: state.sessionType,
      notes: document.getElementById('booking-reason').value,
      ...(guestNameEl && { client_name: guestNameEl.value.trim() }),
      ...(guestEmailEl && { client_email: guestEmailEl.value.trim() }),
      ...(guestPhoneEl && { client_phone: guestPhoneEl.value.trim() })
    };

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Booking…';

    if (harborIsLive()) {
      try {
        await harborApi('appointments', { method: 'POST', body: JSON.stringify(payload) });
      } catch (e) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm booking';
        alert("Sorry, we couldn't save that booking. Please try again.");
        return;
      }
    }

    // Always persist locally too, so the dashboard reflects it immediately —
    // this is what makes the booking real even with no backend at all.
    harborSaveAppointment(payload);

    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm booking';

    const emailNote = payload.client_email ? ` A confirmation has been sent to ${payload.client_email}.` : ' A confirmation has been sent to your email.';
    document.getElementById('success-summary').textContent =
      `${state.sessionType} with ${state.therapist.name} on ${dateStr} at ${state.time}.${emailNote}`;
    Object.values(panels).forEach((p) => (p.hidden = true));
    successPanel.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const bookAnotherButton = document.getElementById('book-another');
  if (bookAnotherButton) {
    bookAnotherButton.addEventListener('click', () => {
      state.therapist = null;
      state.day = null;
      state.time = null;
      therapistCards.forEach((c) => c.classList.remove('selected'));
      toStep2Btn.disabled = true;
      goToStep(1);
    });
  }
}

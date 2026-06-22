(function () {
  var root    = document.querySelector('.mm-book');
  if (!root) return;
  var form    = root.querySelector('#mmForm');
  var panels  = root.querySelectorAll('.mm-panel');
  var footer  = root.querySelector('.mm-footer');
  var prevBtn = root.querySelector('#mmPrev');
  var subBtn  = root.querySelector('#mmSubmit');
  var nextBtn = root.querySelector('#mmNext');
  var success = root.querySelector('#mmSuccess');
  var current = 0;
  var last    = panels.length - 1;

  /* ---- date: min today, custom clear, valid styling ---- */
  var dateWrap = root.querySelector('#mm-date-wrap');
  var checkin  = root.querySelector('#mm-checkin');
  var dateClear= root.querySelector('#mm-date-clear');
  checkin.min  = new Date().toISOString().split('T')[0];
  function paintDate() { dateWrap.classList.toggle('is-filled', !!checkin.value); }
  checkin.addEventListener('change', function () { paintDate(); clearErr(checkin); });
  dateClear.addEventListener('click', function () { checkin.value = ''; paintDate(); });

  /* ---- sliders ---- */
  function bindSlider(id, valId) {
    var s = root.querySelector(id), out = root.querySelector(valId);
    function paint() {
      out.textContent = s.value;
      var pct = (s.value - s.min) / (s.max - s.min) * 100;
      s.style.background = 'linear-gradient(90deg, var(--slate) ' + pct + '%, var(--track) ' + pct + '%)';
    }
    s.addEventListener('input', paint); paint();
  }
  bindSlider('#mm-guests', '#mm-guests-val');
  bindSlider('#mm-rooms',  '#mm-rooms-val');

  /* ---- step control: button enable/disable like eForm ---- */
  function setStep(i) {
    current = i;
    panels.forEach(function (p, idx) { p.classList.toggle('is-active', idx === i); });
    // first step: only Next active. last step: only Prev + Submit active.
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === last);
    subBtn.disabled  = (i !== last);
    root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---- validation ---- */
  function clearErr(el) { el.closest('.mm-field').classList.remove('is-invalid'); }

  function validateField(field) {
    var input = field.querySelector('.mm-input, .mm-select');
    if (!input) return true;
    var v = input.value.trim();
    var rule = field.getAttribute('data-rule');
    var ok = v.length > 0;
    if (ok && rule === 'name')  ok = /^[A-Za-z][A-Za-z .']{1,}$/.test(v);
    if (ok && rule === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (ok && rule === 'phone') ok = /^[+]?[\d\s().-]{7,16}$/.test(v);
    field.classList.toggle('is-invalid', !ok);
    return ok;
  }

  function validatePanel(i) {
    var fields = panels[i].querySelectorAll('.mm-field[data-required]');
    var allOk = true, firstBad = null;
    fields.forEach(function (f) {
      var ok = validateField(f);
      if (!ok) { allOk = false; if (!firstBad) firstBad = f; }
    });
    if (firstBad) { var el = firstBad.querySelector('.mm-input,.mm-select'); if (el) el.focus(); }
    return allOk;
  }

  root.querySelectorAll('.mm-field[data-required] .mm-input, .mm-field[data-required] .mm-select')
    .forEach(function (el) { el.addEventListener('input', function () { clearErr(el); }); });

  /* ---- nav ---- */
  nextBtn.addEventListener('click', function () { if (validatePanel(0)) setStep(1); });
  prevBtn.addEventListener('click', function () { setStep(0); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (current !== last) { if (validatePanel(0)) setStep(1); return; }
    if (!validatePanel(1)) return;

    var data = {
      checkin: form.checkin.value,
      nights:  form.nights.value,
      guests:  form.guests.value,
      rooms:   form.rooms.value,
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      phone:   form.phone.value.trim()
    };
    console.log('Misty Mount booking request:', data);   // <-- wire to your endpoint

    form.style.display = 'none';
    root.querySelector('#mmSuccessMsg').textContent =
      'Thank you, ' + data.name.split(' ')[0] + '. We\'ll confirm your stay by email shortly.';
    success.classList.add('is-active');
  });

  // init
  setStep(0);
})();
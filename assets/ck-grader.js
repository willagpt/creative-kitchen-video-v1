/**
 * Creative Kitchen — Colour Grader v3
 * Clean floating panel on right edge. Expands on click.
 * Colour presets + sliders + perspective rotation.
 * RULES: ZERO monkey-patching. Simple polling. All try-catch wrapped.
 */
(function() {
  'use strict';

  var PRESETS = [
    { name: 'Original', f: { brightness: 100, contrast: 100, saturate: 100, temperature: 0, shadows: 0 } },
    { name: 'Food Pop', f: { brightness: 105, contrast: 112, saturate: 130, temperature: 8, shadows: -10 } },
    { name: 'Warm Gold', f: { brightness: 103, contrast: 105, saturate: 115, temperature: 18, shadows: -5 } },
    { name: 'Cool Clean', f: { brightness: 105, contrast: 108, saturate: 95, temperature: -12, shadows: 5 } },
    { name: 'Rich Cinema', f: { brightness: 97, contrast: 118, saturate: 110, temperature: 5, shadows: -15 } },
    { name: 'Matte Film', f: { brightness: 102, contrast: 92, saturate: 90, temperature: 3, shadows: 12 } },
    { name: 'Vibrant', f: { brightness: 103, contrast: 110, saturate: 145, temperature: 2, shadows: -8 } },
    { name: 'Moody Dark', f: { brightness: 90, contrast: 120, saturate: 105, temperature: -5, shadows: -20 } },
    { name: 'Pastel Soft', f: { brightness: 108, contrast: 90, saturate: 85, temperature: 6, shadows: 8 } },
    { name: 'High Key', f: { brightness: 115, contrast: 95, saturate: 100, temperature: 0, shadows: 10 } },
    { name: 'Earthy', f: { brightness: 100, contrast: 108, saturate: 105, temperature: 12, shadows: -8 } },
    { name: 'Punchy', f: { brightness: 100, contrast: 125, saturate: 125, temperature: 0, shadows: -12 } },
  ];

  // Storage
  function loadGrades() { try { return JSON.parse(localStorage.getItem('ck-grades') || '{}'); } catch(e) { return {}; } }
  function saveGrades(g) { localStorage.setItem('ck-grades', JSON.stringify(g)); }
  function getGrade(id) { return loadGrades()[id] || { brightness:100,contrast:100,saturate:100,temperature:0,shadows:0,tiltX:0,tiltY:0,rotate:0 }; }
  function setGrade(id, g) { var all = loadGrades(); all[id] = g; saveGrades(all); }

  // CSS
  function filterCSS(g) {
    var p = ['brightness('+(g.brightness/100)+')','contrast('+(g.contrast/100)+')','saturate('+(g.saturate/100)+')'];
    if (g.temperature > 0) { p.push('sepia('+(g.temperature/100)+')'); p.push('saturate('+(1+g.temperature/50)+')'); }
    else if (g.temperature < 0) { p.push('hue-rotate('+(g.temperature*2)+'deg)'); }
    if (g.shadows) p[0] = 'brightness('+((g.brightness/100)*(1+g.shadows/200))+')';
    return p.join(' ');
  }
  function transformCSS(g) {
    var x=g.tiltX||0,y=g.tiltY||0,r=g.rotate||0;
    return (x||y||r) ? 'perspective(800px) rotateX('+x+'deg) rotateY('+y+'deg) rotate('+r+'deg)' : '';
  }
  function apply(g) {
    try {
      var v = document.querySelector('video');
      if (!v) return;
      v.style.filter = filterCSS(g);
      var t = transformCSS(g);
      v.style.transform = t;
      if (t) v.style.transformOrigin = 'center center';
    } catch(e) {}
  }

  var shotId = null;
  var grade = { brightness:100,contrast:100,saturate:100,temperature:0,shadows:0,tiltX:0,tiltY:0,rotate:0 };
  var open = false;
  var colourOpen = true;
  var compareOpen = false;
  var perspOpen = false;
  var referenceFrame = localStorage.getItem('ck-ref-frame') || null;  // data URL of reference snapshot
  var referenceName = localStorage.getItem('ck-ref-name') || '';
  var showingOriginal = false;

  // Detect clip
  function detectClip() {
    try {
      var all = document.querySelectorAll('button,a,span,div');
      for (var i = 0; i < all.length; i++) {
        if (all[i].textContent.trim() === 'Back') {
          var p = all[i].parentElement;
          if (!p) continue;
          var ch = p.querySelectorAll('span,div,h1,h2,h3');
          for (var j = 0; j < ch.length; j++) {
            var t = ch[j].textContent.trim();
            if (t.length > 5 && t.length < 60 && /[A-Z0-9_]/.test(t) &&
                ['Back','PENDING','APPROVED','REJECTED','BODY','HOOK','CTA','PRODUCT','SOCIAL_PROOF','TRANSITION','Prev','Next'].indexOf(t) === -1)
              return t;
          }
        }
      }
    } catch(e) {}
    return null;
  }
  function getId(name) {
    try { var s=JSON.parse(localStorage.getItem('ck-shots-db')||'[]'); for(var i=0;i<s.length;i++) if(s[i].name===name) return String(s[i].id); } catch(e) {}
    return name;
  }

  // Build panel
  function build() {
    if (document.getElementById('ck-gp')) return;

    // Inject styles
    var css = document.createElement('style');
    css.id = 'ck-gp-css';
    css.textContent = [
      '#ck-gp{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:9997;font:11px -apple-system,BlinkMacSystemFont,sans-serif;transition:width .25s ease;}',
      '#ck-gp.closed{width:36px;cursor:pointer;}',
      '#ck-gp.open{width:240px;}',
      '#ck-gp-inner{background:#111113;border:1px solid #27272a;border-right:none;border-radius:10px 0 0 10px;overflow:hidden;box-shadow:-2px 0 16px rgba(0,0,0,.4);height:100%;}',
      '#ck-gp .tab{display:flex;align-items:center;gap:6px;padding:8px 10px;cursor:pointer;border-bottom:1px solid #1e1e2e;transition:background .15s;}',
      '#ck-gp .tab:hover{background:#1a1a2e;}',
      '#ck-gp .tab-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:rgba(129,140,248,.1);color:#818cf8;font-size:12px;}',
      '#ck-gp .tab-label{font-size:10px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:.5px;}',
      '#ck-gp .tab-arrow{margin-left:auto;color:#525252;font-size:8px;transition:transform .2s;}',
      '#ck-gp .sec{padding:8px 12px;display:none;}',
      '#ck-gp .sec.show{display:block;}',
      '#ck-gp .preset-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:10px;}',
      '#ck-gp .preset{padding:5px 3px;border-radius:4px;background:transparent;border:1px solid transparent;color:#71717a;cursor:pointer;font-size:9px;font-family:inherit;transition:all .12s;text-align:center;}',
      '#ck-gp .preset:hover{background:#27272a;border-color:#3f3f46;}',
      '#ck-gp .preset.on{background:rgba(129,140,248,.1);border-color:rgba(129,140,248,.3);color:#c7d2fe;}',
      '#ck-gp .row{margin-bottom:7px;}',
      '#ck-gp .row-head{display:flex;justify-content:space-between;margin-bottom:2px;}',
      '#ck-gp .row-label{font-size:9px;color:#52525b;}',
      '#ck-gp .row-val{font-size:9px;color:#71717a;font-variant-numeric:tabular-nums;min-width:20px;text-align:right;}',
      '#ck-gp input[type=range]{width:100%;height:3px;-webkit-appearance:none;appearance:none;background:#27272a;border-radius:2px;outline:none;cursor:pointer;}',
      '#ck-gp input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#818cf8;border:2px solid #111;cursor:pointer;}',
      '#ck-gp input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#818cf8;border:2px solid #111;cursor:pointer;}',
      '#ck-gp .act{display:flex;gap:4px;margin-top:6px;}',
      '#ck-gp .act button{flex:1;padding:4px;border-radius:4px;background:transparent;color:#71717a;border:1px solid #27272a;font-size:9px;cursor:pointer;font-family:inherit;transition:all .12s;}',
      '#ck-gp .act button:hover{border-color:#818cf8;color:#a5b4fc;}',
      '#ck-gp .compare-box{display:flex;gap:4px;margin-bottom:8px;}',
      '#ck-gp .compare-frame{flex:1;aspect-ratio:16/9;border-radius:4px;overflow:hidden;border:1px solid #27272a;background:#09090b;position:relative;display:flex;align-items:center;justify-content:center;}',
      '#ck-gp .compare-frame img,#ck-gp .compare-frame canvas{width:100%;height:100%;object-fit:cover;}',
      '#ck-gp .compare-frame .label{position:absolute;top:2px;left:3px;font-size:7px;color:#525252;text-transform:uppercase;letter-spacing:.5px;pointer-events:none;}',
      '#ck-gp .compare-empty{color:#3f3f46;font-size:8px;text-align:center;padding:8px 4px;}',
      '#ck-gp .ba-btn{width:100%;padding:6px;border-radius:4px;background:rgba(129,140,248,.06);color:#71717a;border:1px solid #27272a;font-size:9px;cursor:pointer;font-family:inherit;transition:all .12s;text-align:center;user-select:none;}',
      '#ck-gp .ba-btn:hover{border-color:#818cf8;color:#a5b4fc;}',
      '#ck-gp .ba-btn.active{background:rgba(129,140,248,.15);border-color:#818cf8;color:#c7d2fe;}',
    ].join('\n');
    document.head.appendChild(css);

    var panel = document.createElement('div');
    panel.id = 'ck-gp';
    panel.className = 'closed';

    panel.innerHTML =
      '<div id="ck-gp-inner">' +
        // Closed tab (just the icon strip)
        '<div id="ck-gp-closed" style="display:flex;flex-direction:column;align-items:center;padding:6px 0;">' +
          '<div class="tab-icon" style="margin:4px 0;" title="Colour Grade">C</div>' +
          '<div class="tab-icon" style="margin:4px 0;" title="Compare">A/B</div>' +
          '<div class="tab-icon" style="margin:4px 0;" title="Perspective">P</div>' +
        '</div>' +
        // Open content
        '<div id="ck-gp-open" style="display:none;">' +
          // Colour Grade section
          '<div class="tab" id="ck-ct">' +
            '<div class="tab-icon">C</div>' +
            '<span class="tab-label">Colour Grade</span>' +
            '<span class="tab-arrow" id="ck-ca">\u25BC</span>' +
          '</div>' +
          '<div class="sec show" id="ck-cs">' +
            '<div class="preset-grid" id="ck-presets"></div>' +
            '<div id="ck-colour-sliders"></div>' +
            '<div class="act">' +
              '<button id="ck-reset-c">Reset</button>' +
              '<button id="ck-match">Match prev</button>' +
            '</div>' +
          '</div>' +
          // Compare section
          '<div class="tab" id="ck-cmp-tab">' +
            '<div class="tab-icon">A/B</div>' +
            '<span class="tab-label">Compare</span>' +
            '<span class="tab-arrow" id="ck-cmp-a">\u25BC</span>' +
          '</div>' +
          '<div class="sec" id="ck-cmp-sec">' +
            '<div class="compare-box">' +
              '<div class="compare-frame" id="ck-ref-box">' +
                '<span class="label">Reference</span>' +
                '<div class="compare-empty" id="ck-ref-empty">No reference set</div>' +
                '<img id="ck-ref-img" style="display:none;" />' +
              '</div>' +
              '<div class="compare-frame" id="ck-cur-box">' +
                '<span class="label">Current</span>' +
                '<canvas id="ck-cur-canvas"></canvas>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:8px;color:#525252;text-align:center;margin-bottom:6px;" id="ck-ref-label"></div>' +
            '<button class="ba-btn" id="ck-ba-btn">Hold for Original (Before/After)</button>' +
            '<div class="act" style="margin-top:6px;">' +
              '<button id="ck-set-ref">Set as Reference</button>' +
              '<button id="ck-clear-ref">Clear Reference</button>' +
            '</div>' +
            '<div class="act" style="margin-top:4px;">' +
              '<button id="ck-snap-compare">Refresh Preview</button>' +
            '</div>' +
          '</div>' +
          // Perspective section
          '<div class="tab" id="ck-pt">' +
            '<div class="tab-icon">P</div>' +
            '<span class="tab-label">Perspective</span>' +
            '<span class="tab-arrow" id="ck-pa">\u25BC</span>' +
          '</div>' +
          '<div class="sec" id="ck-ps">' +
            '<div id="ck-persp-sliders"></div>' +
            '<div class="act"><button id="ck-reset-p">Reset Perspective</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);

    // Toggle open/closed
    document.getElementById('ck-gp-closed').onclick = function() { togglePanel(true); };

    // Section toggles
    document.getElementById('ck-ct').onclick = function() {
      colourOpen = !colourOpen;
      document.getElementById('ck-cs').className = colourOpen ? 'sec show' : 'sec';
      document.getElementById('ck-ca').style.transform = colourOpen ? 'rotate(180deg)' : '';
    };
    document.getElementById('ck-cmp-tab').onclick = function() {
      compareOpen = !compareOpen;
      document.getElementById('ck-cmp-sec').className = compareOpen ? 'sec show' : 'sec';
      document.getElementById('ck-cmp-a').style.transform = compareOpen ? 'rotate(180deg)' : '';
      if (compareOpen) snapCurrentFrame();
    };
    document.getElementById('ck-pt').onclick = function() {
      perspOpen = !perspOpen;
      document.getElementById('ck-ps').className = perspOpen ? 'sec show' : 'sec';
      document.getElementById('ck-pa').style.transform = perspOpen ? 'rotate(180deg)' : '';
    };

    // Build presets
    var grid = document.getElementById('ck-presets');
    PRESETS.forEach(function(p, i) {
      var b = document.createElement('button');
      b.className = 'preset';
      b.dataset.i = i;
      b.textContent = p.name;
      b.onclick = function(e) {
        e.stopPropagation();
        grade = Object.assign(grade, JSON.parse(JSON.stringify(PRESETS[i].f)));
        apply(grade);
        updateUI();
        if (shotId) setGrade(shotId, grade);
      };
      grid.appendChild(b);
    });

    // Build colour sliders
    var cSliders = document.getElementById('ck-colour-sliders');
    [
      { id:'brightness', label:'Exposure', min:70, max:130, def:100 },
      { id:'contrast', label:'Contrast', min:70, max:150, def:100 },
      { id:'saturate', label:'Saturation', min:50, max:170, def:100 },
      { id:'temperature', label:'Warmth', min:-30, max:30, def:0 },
      { id:'shadows', label:'Shadows', min:-25, max:25, def:0 },
    ].forEach(function(s) {
      cSliders.appendChild(makeSlider(s, function(v) { grade[s.id]=v; apply(grade); if(shotId) setGrade(shotId,grade); }));
    });

    // Build perspective sliders
    var pSliders = document.getElementById('ck-persp-sliders');
    [
      { id:'tiltX', label:'Tilt Up/Down', min:-20, max:20, def:0 },
      { id:'tiltY', label:'Tilt Left/Right', min:-20, max:20, def:0 },
      { id:'rotate', label:'Dutch Angle', min:-15, max:15, def:0 },
    ].forEach(function(s) {
      pSliders.appendChild(makeSlider(s, function(v) { grade[s.id]=v; apply(grade); if(shotId) setGrade(shotId,grade); }));
    });

    // Action buttons
    document.getElementById('ck-reset-c').onclick = function(e) {
      e.stopPropagation();
      Object.assign(grade, { brightness:100,contrast:100,saturate:100,temperature:0,shadows:0 });
      apply(grade); updateUI(); if(shotId) setGrade(shotId,grade);
    };
    document.getElementById('ck-match').onclick = function(e) {
      e.stopPropagation();
      var all = loadGrades(), keys = Object.keys(all), last = null;
      for (var i = keys.length-1; i >= 0; i--) { if (keys[i] !== shotId) { last = keys[i]; break; } }
      if (!last) return;
      var prev = all[last];
      Object.assign(grade, { brightness:prev.brightness,contrast:prev.contrast,saturate:prev.saturate,temperature:prev.temperature,shadows:prev.shadows });
      apply(grade); updateUI(); if(shotId) setGrade(shotId,grade);
    };
    document.getElementById('ck-reset-p').onclick = function(e) {
      e.stopPropagation();
      Object.assign(grade, { tiltX:0,tiltY:0,rotate:0 });
      apply(grade); updateUI(); if(shotId) setGrade(shotId,grade);
    };

    // --- Compare section wiring ---

    // Before/After: hold to see original, release to see graded
    var baBtn = document.getElementById('ck-ba-btn');
    baBtn.onmousedown = function(e) {
      e.stopPropagation();
      showingOriginal = true;
      this.className = 'ba-btn active';
      this.textContent = 'Showing Original...';
      try { var v = document.querySelector('video'); if (v) { v.style.filter = 'none'; v.style.transform = 'none'; } } catch(e) {}
    };
    baBtn.onmouseup = baBtn.onmouseleave = function(e) {
      e.stopPropagation();
      if (!showingOriginal) return;
      showingOriginal = false;
      this.className = 'ba-btn';
      this.textContent = 'Hold for Original (Before/After)';
      apply(grade);
    };

    // Set current frame as reference
    document.getElementById('ck-set-ref').onclick = function(e) {
      e.stopPropagation();
      try {
        var v = document.querySelector('video');
        if (!v) return;
        var c = document.createElement('canvas');
        c.width = v.videoWidth || 320;
        c.height = v.videoHeight || 180;
        var ctx = c.getContext('2d');
        // Apply current grade filter to the canvas
        ctx.filter = filterCSS(grade);
        ctx.drawImage(v, 0, 0, c.width, c.height);
        referenceFrame = c.toDataURL('image/jpeg', 0.7);
        referenceName = lastClip || 'Unknown';
        localStorage.setItem('ck-ref-frame', referenceFrame);
        localStorage.setItem('ck-ref-name', referenceName);
        updateRefUI();
      } catch(err) { console.warn('[CK] Reference capture failed:', err); }
    };

    // Clear reference
    document.getElementById('ck-clear-ref').onclick = function(e) {
      e.stopPropagation();
      referenceFrame = null;
      referenceName = '';
      localStorage.removeItem('ck-ref-frame');
      localStorage.removeItem('ck-ref-name');
      updateRefUI();
    };

    // Refresh current preview
    document.getElementById('ck-snap-compare').onclick = function(e) {
      e.stopPropagation();
      snapCurrentFrame();
    };

    // Load existing reference
    updateRefUI();

    // Close on click outside
    document.addEventListener('click', function(e) {
      if (open && !panel.contains(e.target)) togglePanel(false);
    });
  }

  function togglePanel(show) {
    open = show;
    var p = document.getElementById('ck-gp');
    p.className = show ? 'open' : 'closed';
    document.getElementById('ck-gp-closed').style.display = show ? 'none' : 'flex';
    document.getElementById('ck-gp-open').style.display = show ? 'block' : 'none';
  }

  // Reference UI
  function updateRefUI() {
    try {
      var img = document.getElementById('ck-ref-img');
      var empty = document.getElementById('ck-ref-empty');
      var label = document.getElementById('ck-ref-label');
      if (referenceFrame) {
        img.src = referenceFrame;
        img.style.display = 'block';
        empty.style.display = 'none';
        label.textContent = 'Ref: ' + referenceName;
      } else {
        img.style.display = 'none';
        empty.style.display = 'block';
        label.textContent = '';
      }
    } catch(e) {}
  }

  // Capture current video frame with grade applied
  function snapCurrentFrame() {
    try {
      var v = document.querySelector('video');
      var canvas = document.getElementById('ck-cur-canvas');
      if (!v || !canvas) return;
      canvas.width = 200;
      canvas.height = Math.round(200 * (v.videoHeight || 9) / (v.videoWidth || 16));
      var ctx = canvas.getContext('2d');
      ctx.filter = filterCSS(grade);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    } catch(e) {}
  }

  function makeSlider(s, onChange) {
    var d = document.createElement('div');
    d.className = 'row';
    d.innerHTML = '<div class="row-head"><span class="row-label">'+s.label+'</span><span class="row-val" id="ckv-'+s.id+'">'+(grade[s.id]||s.def)+'</span></div><input type="range" id="cks-'+s.id+'" min="'+s.min+'" max="'+s.max+'" step="1" value="'+(grade[s.id]||s.def)+'"/>';
    setTimeout(function() {
      var el = document.getElementById('cks-'+s.id);
      if (el) el.addEventListener('input', function(e) {
        e.stopPropagation();
        var v = parseFloat(this.value);
        document.getElementById('ckv-'+s.id).textContent = v;
        onChange(v);
      });
    }, 50);
    return d;
  }

  function updateUI() {
    ['brightness','contrast','saturate','temperature','shadows','tiltX','tiltY','rotate'].forEach(function(k) {
      var s = document.getElementById('cks-'+k), v = document.getElementById('ckv-'+k);
      if (s) s.value = grade[k]||0;
      if (v) v.textContent = grade[k]||0;
    });
    // Highlight matching preset
    var btns = document.querySelectorAll('#ck-presets .preset');
    btns.forEach(function(b, i) {
      var p = PRESETS[i].f;
      var match = p.brightness===grade.brightness && p.contrast===grade.contrast && p.saturate===grade.saturate && p.temperature===grade.temperature && p.shadows===grade.shadows;
      b.className = match ? 'preset on' : 'preset';
    });
  }

  // Clip detection
  var lastClip = null;
  function check() {
    try {
      var video = document.querySelector('video');
      var panel = document.getElementById('ck-gp');
      if (!video) { if (panel) panel.style.display = 'none'; lastClip = null; return; }
      if (panel) panel.style.display = 'block';
      if (!panel) build();

      var name = detectClip();
      if (!name || name === lastClip) return;
      lastClip = name;
      shotId = getId(name);
      grade = getGrade(shotId);
      apply(grade);
      updateUI();
    } catch(e) {}
  }

  // Init
  build();
  setInterval(check, 2000);
  setTimeout(check, 800);
  console.log('[CK] Colour Grader v3 — '+PRESETS.length+' presets + perspective');
})();

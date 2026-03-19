/**
 * Creative Kitchen — Shot Sub-types
 * Adds a sub-type dropdown to the Curate clip detail view.
 * Pre-tags all clips based on category/name heuristics.
 * Sub-types: food-action, food-beauty, lifestyle, product
 */
(function() {
  'use strict';

  var SUBTYPES = [
    { id: 'food-action', label: 'Food Action', desc: 'Close-up food with movement (pour, cut, squeeze, lift)', color: '#f97316' },
    { id: 'food-beauty', label: 'Food Beauty', desc: 'Static or slow food beauty shot, plated dish', color: '#eab308' },
    { id: 'lifestyle', label: 'Lifestyle', desc: 'Person interacting with product', color: '#8b5cf6' },
    { id: 'product', label: 'Product', desc: 'Packaging, branding, delivery, unboxing', color: '#06b6d4' },
    { id: 'stop-motion', label: 'Stop Motion', desc: 'Animated stop motion sequences', color: '#ec4899' },
  ];

  // ===== STORAGE =====
  function loadSubtypes() { try { return JSON.parse(localStorage.getItem('ck-subtypes') || '{}'); } catch(e) { return {}; } }
  function saveSubtypes(m) { localStorage.setItem('ck-subtypes', JSON.stringify(m)); }
  function getSubtype(shotId) { return loadSubtypes()[shotId] || null; }
  function setSubtype(shotId, subtype) { var m = loadSubtypes(); m[shotId] = subtype; saveSubtypes(m); }

  // ===== PRE-TAG ON FIRST LOAD =====
  function preTagAll() {
    var existing = loadSubtypes();
    if (Object.keys(existing).length > 0) return; // Already tagged

    try {
      var shots = JSON.parse(localStorage.getItem('ck-shots-db') || '[]');
      if (!shots.length) return;

      var map = {};
      shots.forEach(function(s) {
        var id = String(s.id);
        var name = (s.name || '').toLowerCase();
        var cat = (s.category || '').toLowerCase();
        var type = (s.type || '').toLowerCase();

        // Category-based rules
        if (cat === 'food porn') {
          // Food porn shots — check for action keywords
          if (name.includes('pour') || name.includes('squeeze') || name.includes('drizzle') || name.includes('cut') || name.includes('slice')) {
            map[id] = 'food-action';
          } else {
            // Default food porn to food-action (most have movement)
            map[id] = 'food-action';
          }
        }
        else if (cat === 'eating') { map[id] = 'lifestyle'; }
        else if (cat === 'chef') { map[id] = 'lifestyle'; }
        else if (cat === 'creative') {
          // Creative hooks — mostly lifestyle/people shots
          map[id] = 'lifestyle';
        }
        else if (cat === 'delivery') { map[id] = 'product'; }
        else if (cat === 'unboxing') { map[id] = 'product'; }
        else if (cat === 'graphics') { map[id] = 'product'; }
        else if (cat === 'stop motion') { map[id] = 'stop-motion'; }
        else if (cat === 'bts') { map[id] = 'lifestyle'; }
        else if (cat === 'we transfer') {
          // Camera roll codes — mostly food shots from production
          // PGHS codes that are product type stay as product
          if (type === 'product') {
            map[id] = 'product';
          }
          // V1-xxxx codes are from a specific food shoot
          else if (name.startsWith('v1-')) {
            map[id] = 'food-action';
          }
          // A/B camera codes are food production
          else if (/^[ab]\d{3}_c\d{3}/.test(name)) {
            map[id] = 'food-action';
          }
          // PGHS body shots from We Transfer — likely food beauty
          else if (name.startsWith('pghs')) {
            map[id] = 'food-beauty';
          }
          else {
            map[id] = 'food-action';
          }
        }
        else {
          // Unknown category — guess from type
          if (type === 'hook') map[id] = 'food-action';
          else if (type === 'cta') map[id] = 'product';
          else if (type === 'product') map[id] = 'product';
          else map[id] = 'food-beauty';
        }
      });

      saveSubtypes(map);

      // Count
      var counts = {};
      for (var k in map) { counts[map[k]] = (counts[map[k]] || 0) + 1; }
      console.log('[CK] Pre-tagged ' + Object.keys(map).length + ' clips:', JSON.stringify(counts));
    } catch(e) {
      console.warn('[CK] Pre-tag failed:', e);
    }
  }

  // ===== PRE-TAG BUILT-IN TAGS (SHOT STYLE, ACTION, SUBJECT, MOOD) =====
  function preTagBuiltInTags() {
    try {
      var shots = JSON.parse(localStorage.getItem('ck-shots-db') || '[]');
      if (!shots.length) return;

      // Check if we already ran this (flag in localStorage)
      if (localStorage.getItem('ck-tags-pretagged') === 'v2') return;

      var changed = 0;
      var subtypes = loadSubtypes();

      shots.forEach(function(s) {
        // Only pre-tag if clip has no tags or empty tags
        if (s.tags && s.tags.length > 0) return;

        var tags = [];
        var cat = (s.category || '').toLowerCase();
        var name = (s.name || '').toLowerCase();
        var type = (s.type || '').toLowerCase();
        var subtype = subtypes[String(s.id)] || '';

        // --- SHOT STYLE ---
        if (cat === 'food porn' || subtype === 'food-action') {
          tags.push('food porn');
          // Guess framing from food porn (most are close-up or macro)
          tags.push('close up');
        }
        else if (subtype === 'food-beauty') {
          tags.push('food porn');
          // Beauty shots are often overhead or wide
          if (name.includes('overhead') || name.includes('grid') || name.includes('flat')) {
            tags.push('overhead');
            tags.push('flat lay');
          } else {
            tags.push('close up');
          }
        }
        else if (cat === 'stop motion' || subtype === 'stop-motion') {
          tags.push('stop motion');
        }
        else if (cat === 'creative') {
          tags.push('handheld');
        }
        else if (cat === 'eating' || cat === 'chef') {
          tags.push('handheld');
        }

        // --- ACTION ---
        if (subtype === 'food-action' || cat === 'food porn') {
          // Camera codes from food shoots often have action
          // A-camera (A001-A003) = main food action shots
          // B-camera (B001-B003) = beauty/detail shots
          if (/^a\d{3}/.test(name)) {
            // A-camera shoots tend to have active food manipulation
            tags.push('plate');
          }
          if (/^b\d{3}/.test(name)) {
            tags.push('plate');
          }
          // V1 codes from specific food action shoot
          if (name.startsWith('v1-')) {
            tags.push('pour');
          }
          // Bottle codes are likely pouring/drizzling
          if (name.includes('bottle')) {
            tags.push('pour');
            tags.push('drizzle');
          }
        }

        if (cat === 'eating') {
          tags.push('fork');
        }
        if (cat === 'chef') {
          tags.push('plate');
          tags.push('stir');
        }
        if (cat === 'unboxing') {
          tags.push('unbox');
          tags.push('open');
        }
        if (cat === 'delivery') {
          tags.push('open');
        }

        // --- SUBJECT ---
        if (cat === 'food porn' || subtype === 'food-action' || subtype === 'food-beauty') {
          tags.push('meal');
        }
        if (cat === 'eating') {
          tags.push('person');
          tags.push('meal');
        }
        if (cat === 'chef') {
          tags.push('person');
          tags.push('kitchen');
          tags.push('hands');
        }
        if (cat === 'creative') {
          tags.push('person');
        }
        if (cat === 'unboxing' || cat === 'delivery') {
          tags.push('box');
          tags.push('delivery');
        }
        if (cat === 'graphics') {
          tags.push('logo');
        }
        if (cat === 'stop motion') {
          tags.push('meal');
        }
        // We Transfer camera codes
        if (cat === 'we transfer') {
          if (type === 'product' || name.startsWith('pghs3') || name.startsWith('pghs4')) {
            tags.push('meal');
            tags.push('table');
          } else {
            tags.push('meal');
            tags.push('ingredient');
          }
        }

        // --- MOOD ---
        if (cat === 'food porn' || subtype === 'food-action' || subtype === 'food-beauty') {
          tags.push('vibrant');
          tags.push('warm');
          if (name.includes('copy')) tags.push('natural light');
          else tags.push('studio');
        }
        if (cat === 'eating' || cat === 'creative') {
          tags.push('bright');
          tags.push('natural light');
        }
        if (cat === 'chef') {
          tags.push('warm');
          tags.push('natural light');
        }
        if (cat === 'unboxing' || cat === 'delivery') {
          tags.push('bright');
          tags.push('clean');
        }
        if (cat === 'stop motion') {
          tags.push('vibrant');
          tags.push('clean');
        }
        if (cat === 'graphics') {
          tags.push('clean');
        }

        // Deduplicate
        tags = tags.filter(function(t, i) { return tags.indexOf(t) === i; });

        if (tags.length > 0) {
          s.tags = tags;
          changed++;
        }
      });

      if (changed > 0) {
        localStorage.setItem('ck-shots-db', JSON.stringify(shots));
        localStorage.setItem('ck-tags-pretagged', 'v2');
        console.log('[CK] Pre-tagged ' + changed + ' clips with built-in tags');
      }
    } catch(e) {
      console.warn('[CK] Built-in tag pre-tag failed:', e);
    }
  }

  // ===== INJECT "SPRINKLE" TAG INTO PRESET LIST =====
  function injectSprinkleTag() {
    try {
      // Find the ACTION section in the tag presets
      var labels = document.querySelectorAll('div, span');
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].textContent.trim() === 'ACTION') {
          var container = labels[i].nextElementSibling || labels[i].parentElement;
          // Check if sprinkle already exists
          if (container && container.textContent.indexOf('sprinkle') === -1) {
            // Find the last tag button in this section
            var tagBtns = container.querySelectorAll('button, span[class*="cursor"], div[class*="cursor"]');
            if (tagBtns.length > 0) {
              var lastBtn = tagBtns[tagBtns.length - 1];
              var sprinkleBtn = lastBtn.cloneNode(true);
              sprinkleBtn.textContent = 'sprinkle';
              lastBtn.parentNode.insertBefore(sprinkleBtn, lastBtn.nextSibling);
            }
          }
          break;
        }
      }
    } catch(e) {}
  }

  // Run pre-tags after shots DB is loaded
  setTimeout(preTagAll, 4000);
  setTimeout(preTagBuiltInTags, 5000);
  // Try to inject sprinkle tag periodically
  setInterval(injectSprinkleTag, 3000);

  // ===== INJECT SUB-TYPE SELECTOR INTO CURATE VIEW =====

  var lastInjectedClip = null;

  function tryInject() {
    try {
      // Only show when on clip detail (video visible)
      var video = document.querySelector('video');
      if (!video) { lastInjectedClip = null; return; }

      // Find the clip name
      var clipName = null;
      var els = document.querySelectorAll('button,a,span,div');
      for (var i = 0; i < els.length; i++) {
        if (els[i].textContent.trim() === 'Back') {
          var p = els[i].parentElement;
          if (!p) continue;
          var ch = p.querySelectorAll('span,div,h1,h2,h3');
          for (var j = 0; j < ch.length; j++) {
            var t = ch[j].textContent.trim();
            if (t.length > 5 && t.length < 60 && /[A-Z0-9_]/.test(t) &&
                ['Back','PENDING','APPROVED','REJECTED','BODY','HOOK','CTA','PRODUCT','SOCIAL_PROOF','TRANSITION','Prev','Next'].indexOf(t) === -1) {
              clipName = t;
              break;
            }
          }
          if (clipName) break;
        }
      }

      if (!clipName || clipName === lastInjectedClip) return;
      lastInjectedClip = clipName;

      // Get shot ID
      var shotId = null;
      try {
        var shots = JSON.parse(localStorage.getItem('ck-shots-db') || '[]');
        for (var s = 0; s < shots.length; s++) {
          if (shots[s].name === clipName) { shotId = String(shots[s].id); break; }
        }
      } catch(e) {}
      if (!shotId) shotId = clipName;

      // Remove old selector
      var old = document.getElementById('ck-subtype-bar');
      if (old) old.remove();

      var currentSubtype = getSubtype(shotId);

      // Build selector bar — inject under the clip header (Back / name / PENDING / BODY)
      var bar = document.createElement('div');
      bar.id = 'ck-subtype-bar';
      bar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 16px 6px;background:#0d0d14;border-bottom:1px solid #1e1e2e;font:10px -apple-system,BlinkMacSystemFont,sans-serif;';

      bar.innerHTML = '<span style="color:#52525b;font-size:9px;text-transform:uppercase;letter-spacing:.5px;margin-right:2px;">Sub-type:</span>';

      SUBTYPES.forEach(function(st) {
        var btn = document.createElement('button');
        btn.dataset.st = st.id;
        var isActive = currentSubtype === st.id;
        btn.style.cssText = 'padding:3px 10px;border-radius:12px;font-size:10px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s;border:1px solid transparent;' +
          (isActive
            ? 'background:' + st.color + '20;color:' + st.color + ';border-color:' + st.color + '40;'
            : 'background:transparent;color:#525252;');
        btn.textContent = st.label;
        btn.title = st.desc;
        btn.onmouseover = function() { if (!isActive) { this.style.background = '#1a1a2e'; this.style.color = '#a1a1aa'; } };
        btn.onmouseout = function() { if (this.dataset.st !== currentSubtype) { this.style.background = 'transparent'; this.style.color = '#525252'; } };
        btn.onclick = function(e) {
          e.stopPropagation();
          setSubtype(shotId, st.id);
          lastInjectedClip = null; // Force refresh
          tryInject();
        };
        bar.appendChild(btn);
      });

      // Find the header bar with Back/name and insert after it
      var headers = document.querySelectorAll('[class*="border-b"], [class*="border-zinc"]');
      var headerBar = null;
      for (var h = 0; h < headers.length; h++) {
        if (headers[h].textContent.indexOf('Back') !== -1 && headers[h].textContent.indexOf(clipName) !== -1) {
          headerBar = headers[h];
          break;
        }
      }

      if (headerBar) {
        headerBar.parentNode.insertBefore(bar, headerBar.nextSibling);
      } else {
        // Fallback: insert at top of main content area
        var main = video.closest('[class*="flex-col"], [class*="flex"]');
        if (main) main.insertBefore(bar, main.firstChild);
      }

    } catch(e) {}
  }

  // Poll every 2s
  setInterval(tryInject, 2000);
  setTimeout(tryInject, 1500);

  console.log('[CK] Sub-types loaded — ' + SUBTYPES.length + ' categories');
})();

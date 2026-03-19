/**
 * Creative Kitchen — Minimal Safe Sync
 * Push only. No auto-restore. No auto-reload. No monkey-patching.
 */
(function() {
  'use strict';
  var SUPA = 'https://ifrxylvoufncdxyltgqt.supabase.co/rest/v1';
  var KEY = 'sb_publishable_9a_w1rEdMOYAcgcT-7cu-g_SsmyxLui';
  var H = function() { return {'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'}; };
  var lastHash = '';
  var pushing = false;

  function hash(s) { var h=0; for(var i=0;i<s.length;i++) h=((h<<5)-h+s.charCodeAt(i))|0; return String(h); }

  // Push local shots to Supabase
  async function push() {
    if (pushing) return;
    try {
      var raw = localStorage.getItem('ck-shots-db');
      if (!raw) return;
      var h = hash(raw);
      if (h === lastHash) return;
      lastHash = h;
      var shots = JSON.parse(raw).filter(function(s) { return s && s.id && s.name; });
      if (!shots.length) return;
      pushing = true;
      dot('push');
      var rows = shots.map(function(s) {
        return {
          id:s.id, name:s.name, fullname:s.fullname||null, path:s.path||null,
          category:s.category||'', type:s.type||'body', style:s.style||'live',
          ratio:s.ratio||'16:9', width:s.width||0, height:s.height||0,
          duration:s.duration||0, size_mb:s.size_mb||0, graded:s.graded!==false,
          approved:s.approved===true?true:null, rejected:s.rejected===true?true:null,
          archived:s.archived===true, trim_in:typeof s.trim_in==='number'?s.trim_in:null,
          trim_out:typeof s.trim_out==='number'?s.trim_out:null,
          curation_note:s.curation_note||null, tags:Array.isArray(s.tags)?s.tags:[],
          star_rating:typeof s.star_rating==='number'?s.star_rating:0,
          updated_at:new Date().toISOString()
        };
      });
      for (var i=0;i<rows.length;i+=500) {
        var r = await fetch(SUPA+'/clips',{method:'POST',headers:Object.assign({},H(),{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(rows.slice(i,i+500))});
        if (!r.ok) throw new Error(r.status);
      }
      pushing = false;
      dot('ok');
      console.log('[CK] Pushed '+rows.length+' clips to Supabase');
    } catch(e) {
      pushing = false;
      dot('err');
      console.warn('[CK] Push error:',e.message);
    }
  }

  // Pull from Supabase (manual only — colleague clicks button)
  async function pull() {
    try {
      dot('pull');
      var r = await fetch(SUPA+'/clips?select=*&order=id.asc&limit=2000',{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}});
      if (!r.ok) throw new Error(r.status);
      var remote = await r.json();
      if (!remote||!remote.length) { dot('ok'); alert('Cloud is empty — nothing to pull.'); return; }
      var raw = localStorage.getItem('ck-shots-db');
      var local = raw ? JSON.parse(raw) : [];
      var localMap = {};
      local.forEach(function(s) { localMap[s.id] = s; });
      var updated=0, added=0;
      remote.forEach(function(rc) {
        if (!rc.name || typeof rc.name !== 'string') return;
        var ls = localMap[rc.id];
        if (!ls) {
          // Add new clip from cloud
          local.push({
            id:rc.id, name:rc.name, fullname:rc.fullname||rc.name, path:rc.path||'',
            category:rc.category||'', type:rc.type||'body', style:rc.style||'live',
            ratio:rc.ratio||'16:9', width:rc.width||1920, height:rc.height||1080,
            duration:typeof rc.duration==='number'?rc.duration:0,
            size_mb:typeof rc.size_mb==='number'?rc.size_mb:0,
            graded:rc.graded!==false,
            approved:rc.approved===true?true:undefined,
            rejected:rc.rejected===true?true:undefined,
            archived:rc.archived===true,
            trim_in:typeof rc.trim_in==='number'?rc.trim_in:undefined,
            trim_out:typeof rc.trim_out==='number'?rc.trim_out:undefined,
            curation_note:rc.curation_note||undefined,
            tags:Array.isArray(rc.tags)?rc.tags:[],
            star_rating:typeof rc.star_rating==='number'?rc.star_rating:0
          });
          added++;
        } else {
          // Update curation fields — cloud wins
          var changed = false;
          if (rc.approved===true&&ls.approved!==true){ls.approved=true;ls.rejected=undefined;changed=true;}
          if (rc.rejected===true&&ls.rejected!==true){ls.rejected=true;ls.approved=undefined;changed=true;}
          if (rc.archived===true&&!ls.archived){ls.archived=true;changed=true;}
          if (typeof rc.trim_in==='number'&&rc.trim_in!==ls.trim_in){ls.trim_in=rc.trim_in;changed=true;}
          if (typeof rc.trim_out==='number'&&rc.trim_out!==ls.trim_out){ls.trim_out=rc.trim_out;changed=true;}
          if (rc.curation_note&&rc.curation_note!==ls.curation_note){ls.curation_note=rc.curation_note;changed=true;}
          if (changed) updated++;
        }
      });
      localStorage.setItem('ck-shots-db', JSON.stringify(local));
      lastHash = hash(JSON.stringify(local));
      dot('ok');
      var msg = 'Pulled: '+updated+' updated, '+added+' new clips.';
      console.log('[CK] '+msg);
      if (updated>0||added>0) {
        alert(msg+' Reloading...');
        window.location.reload();
      } else {
        alert('Already in sync — no changes.');
      }
    } catch(e) {
      dot('err');
      console.warn('[CK] Pull error:',e.message);
      alert('Pull failed: '+e.message);
    }
  }

  // Sync dot indicator
  function dot(state) {
    var d = document.getElementById('ck-dot');
    if (!d) return;
    d.style.background = state==='push'?'#818cf8':state==='pull'?'#818cf8':state==='ok'?'#10b981':state==='err'?'#ef4444':'#525252';
    if (state==='ok') setTimeout(function(){d.style.background='#525252';},3000);
  }

  // Build bottom bar
  function bar() {
    var b = document.createElement('div');
    b.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:9998;display:flex;align-items:center;gap:8px;padding:4px 16px;background:#09090b;border-top:1px solid #18181b;font:10px -apple-system,BlinkMacSystemFont,sans-serif;';
    b.innerHTML='<div id="ck-dot" style="width:6px;height:6px;border-radius:50%;background:#525252;"></div>'+
      '<span style="color:#3f3f46">Auto-push on</span>'+
      '<button id="ck-pull-btn" style="padding:2px 8px;border-radius:4px;background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2);font-size:10px;cursor:pointer;">Pull from cloud</button>'+
      '<div style="flex:1"></div>'+
      '<span style="color:#27272a">Creative Kitchen \u2014 Big Tasty Productions \u00a9 2026</span>';
    document.body.appendChild(b);
    document.getElementById('ck-pull-btn').onclick = pull;
  }

  // Auto-pull: gently check Supabase for curation updates every 30s
  // ONLY updates approved/rejected/trim on EXISTING local clips. Never adds new clips.
  // Never touches name/duration/category. Never reloads page.
  var lastPullHash = '';
  async function autoPull() {
    try {
      var r = await fetch(SUPA+'/clips?select=id,approved,rejected,archived,trim_in,trim_out,curation_note&order=id.asc&limit=2000',{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}});
      if (!r.ok) return;
      var remote = await r.json();
      if (!remote||!remote.length) return;
      var rh = hash(JSON.stringify(remote));
      if (rh === lastPullHash) return; // No cloud changes
      lastPullHash = rh;
      var raw = localStorage.getItem('ck-shots-db');
      if (!raw) return;
      var local = JSON.parse(raw);
      var localMap = {};
      local.forEach(function(s){localMap[s.id]=s;});
      var changed = 0;
      remote.forEach(function(rc) {
        var ls = localMap[rc.id];
        if (!ls) return; // Don't add new clips — only update existing
        if (rc.approved===true&&ls.approved!==true){ls.approved=true;ls.rejected=undefined;changed++;}
        else if (rc.rejected===true&&ls.rejected!==true){ls.rejected=true;ls.approved=undefined;changed++;}
        if (rc.archived===true&&!ls.archived){ls.archived=true;changed++;}
        if (typeof rc.trim_in==='number'&&rc.trim_in!==ls.trim_in){ls.trim_in=rc.trim_in;changed++;}
        if (typeof rc.trim_out==='number'&&rc.trim_out!==ls.trim_out){ls.trim_out=rc.trim_out;changed++;}
      });
      if (changed>0) {
        localStorage.setItem('ck-shots-db',JSON.stringify(local));
        lastHash = hash(JSON.stringify(local)); // Prevent re-pushing what we just pulled
        console.log('[CK] Auto-pulled '+changed+' curation updates from cloud');
        dot('ok');
        // Show notification banner
        showSyncBanner(changed+' update'+(changed>1?'s':'')+' from your colleague');
      }
    } catch(e) {}
  }

  function showSyncBanner(msg) {
    var existing = document.getElementById('ck-sync-banner');
    if (existing) existing.remove();
    var banner = document.createElement('div');
    banner.id = 'ck-sync-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99998;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;background:#064e3b;border-bottom:1px solid #065f46;font:12px -apple-system,sans-serif;color:#6ee7b7;cursor:pointer;transition:opacity .3s;';
    banner.innerHTML = '<span>'+msg+'</span><button style="padding:3px 12px;border-radius:4px;background:#10b981;color:#fff;border:none;font-size:11px;cursor:pointer;font-weight:500;">Refresh to see</button><button style="padding:3px 8px;background:none;border:none;color:#4ade80;cursor:pointer;font-size:14px;">\u2715</button>';
    banner.children[1].onclick = function(e) { e.stopPropagation(); window.location.reload(); };
    banner.children[2].onclick = function(e) { e.stopPropagation(); banner.style.opacity='0'; setTimeout(function(){banner.remove();},300); };
    document.body.appendChild(banner);
  }

  // Init
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',bar); else bar();
  // CRITICAL: pull BEFORE push on startup — otherwise stale local data overwrites cloud
  async function startSync() {
    console.log('[CK] Starting sync — pull first, then push...');
    await autoPull(); // Get latest cloud state
    await push();     // Push merged state back
    console.log('[CK] Initial sync complete');
    // Start ongoing intervals
    setInterval(push, 10000);
    setInterval(autoPull, 30000);
  }
  setTimeout(startSync, 5000);
  console.log('[CK] Sync loaded — pull-first strategy');
})();

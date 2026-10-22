/* Galeria stylizacji paznokci: galeria (/) i panel edycji (/dev) */
(function(){
  /* ---------- sample illustrations (remove data-art and set src to use a real photo) ---------- */
  var ARTS = {
    red:     {comp:'fan',    shape:'almond',   skin:'#EBC2A6', bg:'#F1ECE6', design:'solid',  c:['#C1121F']},
    boomer:  {comp:'single', shape:'oval',     skin:'#E7B896', bg:'#2A2523', design:'ombre',  c:['#F2D3C8','#FFFFFF']},
    french:  {comp:'fan',    shape:'squoval',  skin:'#F0C8AA', bg:'#161616', design:'french', c:['#F1D5CB','#FFFFFF']},
    chrome:  {comp:'pair',   shape:'stiletto', skin:'#C99070', bg:'#E9E4DE', design:'chrome', c:['#0B0B0B','#7A7A7A','#161616','#D0D0D0','#1A1A1A']},
    sage:    {comp:'pair',   shape:'squoval',  skin:'#F1C7A8', bg:'#F4F1EC', design:'dots',   c:['#94AF9F','#FFFFFF']},
    burgund: {comp:'single', shape:'oval',     skin:'#A8714F', bg:'#E8D4C3', design:'solid',  c:['#5A0E21']},
    peach:   {comp:'single', shape:'coffin',   skin:'#D9A27E', bg:'#121212', design:'glitter',c:['#F2A488','#F6D27A']},
    wedding: {comp:'fan',    shape:'almond',   skin:'#EBC2A6', bg:'#FFFFFF', design:'pearl',  c:['#F6E3DE','#FFFFFF']},
    nude:    {comp:'pair',   shape:'almond',   skin:'#A8714F', bg:'#0A0A0A', design:'solid',  c:['#EAD2C6']},
    lavender:{comp:'fan',    shape:'square',   skin:'#EBC2A6', bg:'#26212C', design:'flowers',c:['#C9B3E2','#FFFFFF']},
    ombre:   {comp:'single', shape:'oval',     skin:'#F1C7A8', bg:'#F5F0EB', design:'ombre',  c:['#F2C2BA','#C1121F']},
    gold:    {comp:'pair',   shape:'coffin',   skin:'#D9A27E', bg:'#EFE6D8', design:'goldline',c:['#141414']},
    silver:  {comp:'fan',    shape:'coffin',   skin:'#C99070', bg:'#0D0D0D', design:'chrome', c:['#8C8C95','#F6F6FA','#9C9CA5','#FFFFFF','#7C7C86']},
    hearts:  {comp:'pair',   shape:'square',   skin:'#F0C8AA', bg:'#C1121F', design:'hearts', c:['#F7CAD6','#D3122C']}
  };
  var FREE = {square:.16, squoval:.24, oval:.38, almond:.72, coffin:.8, stiletto:1.1};

  function rng(seed){ var a = 0; for (var i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) | 0;
    return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hex(h){ h = h.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function shade(h, amt){ var c = hex(h); return 'rgb(' + c.map(function(v){ return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }).join(',') + ')'; }
  function rgba(h, a){ var c = hex(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function lum(h){ var c = hex(h); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }

  function nailPath(x, shape, w, L){
    x.beginPath();
    x.moveTo(-w/2, 0);
    if (shape === 'square') { x.lineTo(-w/2, -L); x.lineTo(w/2, -L); }
    else if (shape === 'squoval') { var r = w * .22; x.lineTo(-w/2, -L + r); x.quadraticCurveTo(-w/2, -L, -w/2 + r, -L); x.lineTo(w/2 - r, -L); x.quadraticCurveTo(w/2, -L, w/2, -L + r); }
    else if (shape === 'oval') { x.lineTo(-w/2, -L + w/2); x.ellipse(0, -L + w/2, w/2, w/2, 0, Math.PI, 2 * Math.PI); }
    else if (shape === 'almond') { x.lineTo(-w/2, -L * .55); x.bezierCurveTo(-w/2, -L * .86, -w * .13, -L, 0, -L); x.bezierCurveTo(w * .13, -L, w/2, -L * .86, w/2, -L * .55); }
    else if (shape === 'stiletto') { x.lineTo(-w/2, -L * .45); x.quadraticCurveTo(-w * .42, -L * .82, 0, -L); x.quadraticCurveTo(w * .42, -L * .82, w/2, -L * .45); }
    else if (shape === 'coffin') { x.lineTo(-w/2, -L * .5); x.lineTo(-w * .27, -L); x.lineTo(w * .27, -L); x.lineTo(w/2, -L * .5); }
    x.lineTo(w/2, 0);
    x.ellipse(0, 0, w/2, w * .3, 0, 0, Math.PI);
    x.closePath();
  }
  function heart(x, cx, cy, s){
    x.beginPath(); x.moveTo(cx, cy + s/4);
    x.bezierCurveTo(cx, cy, cx - s/2, cy, cx - s/2, cy + s/4);
    x.bezierCurveTo(cx - s/2, cy + s/2, cx, cy + s * .72, cx, cy + s);
    x.bezierCurveTo(cx, cy + s * .72, cx + s/2, cy + s/2, cx + s/2, cy + s/4);
    x.bezierCurveTo(cx + s/2, cy, cx, cy, cx, cy + s/4); x.fill();
  }

  function paintNail(x, a, w, L, bed, idx, r){
    var c = a.c;
    if (a.design === 'ombre') { var g = x.createLinearGradient(0, w * .3, 0, -L); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); x.fillStyle = g; }
    else if (a.design === 'chrome') { var g2 = x.createLinearGradient(-w/2, -L, w/2, 0); c.forEach(function(s, i){ g2.addColorStop(i / (c.length - 1), s); }); x.fillStyle = g2; }
    else if (a.design === 'pearl') { var g3 = x.createLinearGradient(-w/2, 0, w/2, -L); g3.addColorStop(0, c[0]); g3.addColorStop(.5, '#FFFFFF'); g3.addColorStop(1, '#EED3E0'); x.fillStyle = g3; }
    else x.fillStyle = c[0];
    x.fillRect(-w, -L - w, w * 2, L + w * 2);

    if (a.design === 'french') {
      x.fillStyle = c[1]; x.beginPath();
      x.moveTo(-w, -bed + w * .22); x.quadraticCurveTo(0, -bed - w * .28, w, -bed + w * .22);
      x.lineTo(w, -L - w); x.lineTo(-w, -L - w); x.closePath(); x.fill();
    } else if (a.design === 'glitter') {
      for (var i = 0; i < 260; i++) { var gy = -L + r() * (L + w * .3); var dens = (-gy) / L; if (r() > dens * 1.1) continue;
        x.fillStyle = r() > .3 ? c[1] : '#FFFFFF'; x.globalAlpha = .5 + r() * .5; x.beginPath(); x.arc((r() - .5) * w, gy, w * (.008 + r() * .022), 0, 7); x.fill(); }
      x.globalAlpha = 1;
    } else if (a.design === 'dots') {
      x.fillStyle = c[1]; [.25, .5, .75].forEach(function(t, k){ if ((idx + k) % 2) { x.beginPath(); x.arc(0, -L * t, w * .07, 0, 7); x.fill(); } });
    } else if (a.design === 'flowers' && idx % 2) {
      var fy = -bed * .55, fs = w * .17; x.fillStyle = c[1];
      for (var p = 0; p < 5; p++) { var an = p * 1.2566 + .3; x.beginPath(); x.ellipse(Math.cos(an) * fs, fy + Math.sin(an) * fs, fs * .75, fs * .5, an, 0, 7); x.fill(); }
      x.fillStyle = '#F5C542'; x.beginPath(); x.arc(0, fy, fs * .45, 0, 7); x.fill();
    } else if (a.design === 'hearts' && idx % 2 === 0) {
      x.fillStyle = c[1]; heart(x, 0, -bed * .75, w * .42);
    } else if (a.design === 'goldline') {
      var gg = x.createLinearGradient(-w/2, 0, w/2, -L); gg.addColorStop(0, '#8A6A2B'); gg.addColorStop(.5, '#F7E3A1'); gg.addColorStop(1, '#B58A3A');
      x.strokeStyle = gg; x.lineWidth = w * .06; x.beginPath();
      if (idx % 2) { x.moveTo(-w, -bed * .15); x.lineTo(w, -L * .85); } else { x.ellipse(0, 0, w * .36, w * .3, 0, Math.PI, 2 * Math.PI); }
      x.stroke();
    } else if (a.design === 'pearl' && idx % 2) {
      [-.18, 0, .18].forEach(function(dx){ var gx = dx * w, gy = -w * .1 - Math.abs(dx) * w * .3;
        var sg = x.createRadialGradient(gx - w * .02, gy - w * .02, 0, gx, gy, w * .07); sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(.6, '#D9E2EC'); sg.addColorStop(1, '#8E9AAB');
        x.fillStyle = sg; x.beginPath(); x.arc(gx, gy, w * .065, 0, 7); x.fill(); });
    }
    var side = x.createLinearGradient(-w/2, 0, w/2, 0);
    side.addColorStop(0, 'rgba(0,0,0,.28)'); side.addColorStop(.25, 'rgba(0,0,0,0)'); side.addColorStop(.75, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,.32)');
    x.fillStyle = side; x.fillRect(-w, -L - w, w * 2, L + w * 2);
    var gl = x.createLinearGradient(-w * .32, 0, -w * .05, 0);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.75)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gl; x.beginPath(); x.ellipse(-w * .18, -L * .48, w * .1, L * .36, -.04, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(w * .2, -L * .8, w * .035, L * .07, 0, 0, 7); x.fill();
  }

  function finger(x, a, cx, cy, ang, w, idx, r, S){
    var bed = w * 1.05, L = bed + FREE[a.shape] * w, fw = w * 1.48, top = -bed + fw/2 - w * .12;
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.save();
    x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = w * .7; x.shadowOffsetX = w * .1; x.shadowOffsetY = w * .2;
    var sk = x.createLinearGradient(-fw/2, 0, fw/2, 0);
    sk.addColorStop(0, shade(a.skin, -.22)); sk.addColorStop(.22, a.skin); sk.addColorStop(.55, shade(a.skin, .1)); sk.addColorStop(.85, a.skin); sk.addColorStop(1, shade(a.skin, -.28));
    x.fillStyle = sk; x.beginPath(); x.moveTo(-fw/2, S * 2); x.lineTo(-fw/2, top); x.arc(0, top, fw/2, Math.PI, 0); x.lineTo(fw/2, S * 2); x.closePath(); x.fill();
    x.restore();
    x.strokeStyle = rgba('#5a2e1e', .16); x.lineWidth = w * .025; x.lineCap = 'round';
    for (var k = 0; k < 3; k++) { var ky = bed * (1.75 + k * .12); x.beginPath(); x.moveTo(-fw * .28, ky); x.quadraticCurveTo(0, ky - w * .1, fw * .28, ky); x.stroke(); }
    x.save(); x.scale(1.1, 1.06); nailPath(x, a.shape, w, L); x.fillStyle = shade(a.skin, -.12); x.globalAlpha = .55; x.fill(); x.restore();
    x.save();
    x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = w * .15; x.shadowOffsetY = w * .04;
    nailPath(x, a.shape, w, L); x.fillStyle = a.c[0]; x.fill();
    x.restore();
    x.save(); nailPath(x, a.shape, w, L); x.clip(); paintNail(x, a, w, L, bed, idx, r); x.restore();
    nailPath(x, a.shape, w, L); x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = w * .015; x.stroke();
    x.restore();
    return L;
  }

  function render(key, S){
    var a = ARTS[key]; if (!a) return null;
    var cv = document.createElement('canvas'); cv.width = cv.height = S;
    var x = cv.getContext('2d'), r = rng(key);
    x.fillStyle = a.bg; x.fillRect(0, 0, S, S);
    var dark = lum(a.bg) < .35;
    var lg = x.createRadialGradient(S * .28, S * .18, 0, S * .28, S * .18, S * 1.05);
    lg.addColorStop(0, dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.45)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = lg; x.fillRect(0, 0, S, S);
    for (var f = 0; f < 3; f++) {
      var fx = r() * S, fg = x.createLinearGradient(fx - S * .2, 0, fx + S * .2, S);
      fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(.5, dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = fg; x.fillRect(0, 0, S, S);
    }
    var vg = x.createRadialGradient(S/2, S/2, S * .35, S/2, S/2, S * .78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); x.fillStyle = vg; x.fillRect(0, 0, S, S);

    var F = [];
    if (a.comp === 'fan') { var bw = S * .105;
      F = [[.2, .5, -.27, .86], [.4, .37, -.09, 1], [.6, .39, .08, .98], [.8, .52, .25, .84]].map(function(v){ return [v[0], v[1], v[2], bw * v[3]]; }); }
    else if (a.comp === 'pair') { var pw = S * .19; F = [[.34, .52, -.38, pw], [.66, .4, -.12, pw * .96]]; }
    else { F = [[.52, .42, -.12, S * .32]]; }
    F.forEach(function(v, i){
      var w = v[3], L = w * 1.05 + FREE[a.shape] * w;
      finger(x, a, v[0] * S, v[1] * S + L * .55, v[2], w, i, r, S);
    });
    var img = x.getImageData(0, 0, S, S), d = img.data;
    for (var p = 0; p < d.length; p += 4) { var n = (r() - .5) * 14; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
    x.putImageData(img, 0, 0);
    return cv.toDataURL('image/jpeg', .9);
  }


  /* ---------- config ---------- */
  var MODE = document.documentElement.getAttribute('data-mode') || 'gallery';
  var BASE = document.documentElement.getAttribute('data-base') || '';
  var ART_NAMES = {red:'Czerwień',boomer:'Baby boomer',french:'French',chrome:'Czarny chrom',sage:'Szałwia w kropki',burgund:'Burgund',peach:'Brzoskwinia z brokatem',wedding:'Perłowy róż',nude:'Mleczny nude',lavender:'Lawendowe kwiaty',ombre:'Ombre',gold:'Czerń i złoto',silver:'Srebrne lustro',hearts:'Serduszka'};
  var root = document.getElementById('root');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function uid(){ return Math.random().toString(36).slice(2, 10); }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function normalize(d){
    d = d || {};
    d.header = Object.assign({eyebrow:'Portfolio', eyebrow2:'', title:'Stylizacja paznokci', lead:''}, d.header || {});
    d.techs = Object.assign({label:'Techniki', items:[], note:''}, d.techs || {});
    d.items = Array.isArray(d.items) ? d.items : [];
    return d;
  }

  /* ---------- images ---------- */
  var artCache = {}, uploads = {}, blobUrls = {};
  function artUrl(key){ if (!ARTS[key]) return ''; if (!artCache[key]) { try { artCache[key] = render(key, 1000) || ''; } catch(e) { artCache[key] = ''; } } return artCache[key]; }
  function resolve(p){ if (!p) return ''; if (blobUrls[p]) return blobUrls[p]; return /^(https?:|data:|blob:|\/)/.test(p) ? p : BASE + p; }
  function imgSrc(it){ return it.src ? resolve(it.src) : (it.art ? artUrl(it.art) : ''); }
  function fx(it){ return it.fx == null ? 50 : +it.fx; }
  function fy(it){ return it.fy == null ? 50 : +it.fy; }
  function fz(it){ return it.zoom == null ? 1 : +it.zoom; }
  function fitStyle(it){ var o = fx(it) + '% ' + fy(it) + '%'; return 'object-position:' + o + ';transform-origin:' + o + ';--z:' + fz(it); }

  /* ---------- layout packing (first fit, row by row) ---------- */
  function dims(it){ if (it.type === 'title' || it.type === 'techs') return [3, 2]; var s = Math.max(1, Math.min(3, +it.size || 1)); return [s, s]; }
  function pack(items, cols){
    var occ = [], pos = [];
    items.forEach(function(it){
      var d = dims(it), w = Math.min(d[0], cols), h = d[1];
      for (var r = 0; ; r++) for (var c = 0; c <= cols - w; c++) {
        var ok = true;
        for (var y = r; y < r + h && ok; y++) for (var x = c; x < c + w; x++) if (occ[y] && occ[y][x]) { ok = false; break; }
        if (ok) { for (var y2 = r; y2 < r + h; y2++) { occ[y2] = occ[y2] || []; for (var x2 = c; x2 < c + w; x2++) occ[y2][x2] = 1; } pos.push([c, r]); return; }
      }
    });
    var holes = [];
    for (var y = 0; y < occ.length; y++) for (var x = 0; x < cols; x++) if (!(occ[y] && occ[y][x])) holes.push([x, y]);
    return {pos: pos, holes: holes};
  }

  /* ---------- gallery ---------- */
  function itemHtml(d, it, i, p){
    var h = d.header, t = d.techs, dm = dims(it), c = p.pos[i][0] + 1, r = p.pos[i][1] + 1;
    var st = ' style="--c:' + c + '/' + (c + dm[0]) + ';--r:' + r + '/' + (r + dm[1]) + '"';
    if (it.type === 'title') return '<header class="txt title"' + st + '><div class="eyebrow"><span>' + esc(h.eyebrow) + '</span><span>' + esc(h.eyebrow2) + '</span></div><h1>' + esc(h.title) + '</h1>' + (h.lead ? '<p class="lead">' + esc(h.lead) + '</p>' : '<span></span>') + '</header>';
    if (it.type === 'techs') return '<aside class="txt techs"' + st + '><span class="small">' + esc(t.label) + '</span><ul class="techlist">' + t.items.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><span class="small">' + esc(t.note) + '</span></aside>';
    var alt = it.alt || [it.title, it.meta].filter(Boolean).join(', ') || 'Stylizacja paznokci';
    return '<figure class="tile s' + dm[0] + '"' + st + ' tabindex="0" role="button" data-i="' + i + '" aria-label="Powiększ: ' + esc(it.title || 'zdjęcie') + '">' +
      '<img src="' + esc(imgSrc(it)) + '" alt="' + esc(alt) + '"' + (it.src ? ' loading="lazy" decoding="async"' : '') + ' style="' + fitStyle(it) + '">' +
      ((it.title || it.meta) ? '<figcaption><b>' + esc(it.title || '') + '</b><span>' + esc(it.meta || '') + '</span></figcaption>' : '') + '</figure>';
  }
  /* full render: used by the /dev live preview */
  function galleryHtml(d, showHoles){
    var p = pack(d.items, 6);
    var out = d.items.map(function(it, i){ return itemHtml(d, it, i, p); }).join('');
    if (showHoles) out += p.holes.map(function(x){ return '<div class="empty-tile" aria-hidden="true" style="--c:' + (x[0] + 1) + '/' + (x[0] + 2) + ';--r:' + (x[1] + 1) + '/' + (x[1] + 2) + '"></div>'; }).join('');
    return '<div class="wrap"><section class="grid">' + out + '</section></div>';
  }
  /* clicks on any tile open the viewer over all photos of that data set */
  function bindTiles(container, d){
    function open(el){ if (el) openLb(d, +el.getAttribute('data-i'), el); }
    container.addEventListener('click', function(e){ open(e.target.closest('.tile')); });
    container.addEventListener('keydown', function(e){ var el = e.target.closest && e.target.closest('.tile'); if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(el); } });
  }
  /* fade images in as they arrive */
  function markLoaded(img){ img.classList.add('in'); }
  document.addEventListener('load', function(e){ if (e.target.tagName === 'IMG' && e.target.closest('.tile')) markLoaded(e.target); }, true);
  document.addEventListener('error', function(e){ if (e.target.tagName === 'IMG' && e.target.closest('.tile')) markLoaded(e.target); }, true);
  function markReady(scope){ Array.prototype.forEach.call(scope.querySelectorAll('.tile img'), function(img){ if (img.complete) markLoaded(img); }); }

  /* ---------- viewer ---------- */
  var lb = document.createElement('div'); lb.id = 'lb'; lb.hidden = true;
  lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Powiększone zdjęcie');
  lb.innerHTML = '<div class="lb-top"><span id="lb-count"></span><button class="lb-btn" data-lb="close">Zamknij</button></div>' +
    '<button class="lb-nav" data-lb="prev" aria-label="Poprzednie zdjęcie">‹</button>' +
    '<figure><img id="lb-img" alt=""><figcaption><b id="lb-title"></b><span id="lb-meta"></span></figcaption></figure>' +
    '<button class="lb-nav" data-lb="next" aria-label="Następne zdjęcie">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('#lb-img'), lbT = lb.querySelector('#lb-title'), lbM = lb.querySelector('#lb-meta'), lbC = lb.querySelector('#lb-count');
  var lbData = null, lbList = [], lbPos = 0, lbLast = null;
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function lbShow(){
    var it = lbData.items[lbList[lbPos]];
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = imgSrc(it); lbImg.alt = it.alt || [it.title, it.meta].filter(Boolean).join(', ') || 'Stylizacja paznokci';
    lbT.textContent = it.title || ''; lbM.textContent = it.meta || '';
    lbC.textContent = pad(lbPos + 1) + ' / ' + pad(lbList.length);
    var nx = lbData.items[lbList[(lbPos + 1) % lbList.length]]; if (nx && nx.src) { var pre = new Image(); pre.src = imgSrc(nx); }
  }
  function openLb(d, itemIndex, el){
    lbData = d; lbList = [];
    d.items.forEach(function(it, i){ if (it.type === 'photo') lbList.push(i); });
    lbPos = Math.max(0, lbList.indexOf(itemIndex)); lbLast = el || null;
    lbShow(); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('[data-lb="close"]').focus();
  }
  function closeLb(){ lb.hidden = true; document.body.style.overflow = ''; if (lbLast && document.contains(lbLast)) lbLast.focus(); }
  function step(dd){ if (lbList.length < 2) return; lbPos = (lbPos + dd + lbList.length) % lbList.length; lbShow(); }
  lb.addEventListener('click', function(e){
    var b = e.target.closest('[data-lb]');
    if (b) { var a = b.getAttribute('data-lb'); if (a === 'close') closeLb(); else step(a === 'next' ? 1 : -1); return; }
    if (e.target === lb || e.target.tagName === 'FIGURE') closeLb();
  });
  document.addEventListener('keydown', function(e){
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
  });
  var sx = null;
  lb.addEventListener('pointerdown', function(e){ sx = e.clientX; });
  lb.addEventListener('pointerup', function(e){ if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });

  /* ---------- toast ---------- */
  var toastEl = document.createElement('div'); toastEl.id = 'toast'; toastEl.hidden = true; toastEl.setAttribute('role','status'); document.body.appendChild(toastEl);
  var toastT;
  function toast(m, ms){ toastEl.textContent = m; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.hidden = true; }, ms || 3500); }

  /* ---------- data loading ---------- */
  function embedded(){ var el = document.getElementById('gallery-data'); try { return el ? JSON.parse(el.textContent) : null; } catch(e) { return null; } }
  function load(){
    return fetch(BASE + 'gallery.json', {cache: 'no-cache'})
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function(){ return embedded(); })
      .then(normalize);
  }

  /* ================= GALLERY PAGE ================= */
  if (MODE === 'gallery') {
    var FIRST = 12, MORE = 9;
    load().then(function(d){
      var p = pack(d.items, 6), shown = 0;
      root.innerHTML = '<div class="wrap"><section class="grid" id="grid"></section><div class="more" id="more" aria-hidden="true"><span></span><span></span><span></span></div></div>';
      var grid = document.getElementById('grid'), more = document.getElementById('more');
      bindTiles(grid, d);
      function next(n){
        var end = Math.min(d.items.length, shown + n), html = '';
        for (var i = shown; i < end; i++) html += itemHtml(d, d.items[i], i, p);
        grid.insertAdjacentHTML('beforeend', html); shown = end; markReady(grid);
        if (shown >= d.items.length) { if (io) io.disconnect(); removeEventListener('scroll', kick); removeEventListener('resize', kick); more.remove(); }
      }
      var io = null, ticking = false;
      /* keep adding batches while the loader is within 800px of the screen */
      function fill(){
        ticking = false;
        if (shown >= d.items.length || !document.contains(more)) return;
        if (more.getBoundingClientRect().top < innerHeight + 800) { next(MORE); requestAnimationFrame(fill); }
      }
      function kick(){ if (!ticking) { ticking = true; requestAnimationFrame(fill); } }
      next(FIRST);
      if (shown < d.items.length) {
        if ('IntersectionObserver' in window) { io = new IntersectionObserver(kick, {rootMargin: '800px 0px'}); io.observe(more); }
        addEventListener('scroll', kick, {passive: true}); addEventListener('resize', kick);
        kick();
      }
    });
    return;
  }

  /* ================= DEV PAGE ================= */
  var saved, state, dirty = false, openCrop = {};

  function showDev(){
    var h = state.header, t = state.techs;
    function fl(path, label, val){ return '<label class="fl">' + label + '<input type="text" id="f-' + path.replace('.','-') + '" data-path="' + path + '" value="' + esc(val) + '"></label>'; }
    root.innerHTML =
      '<div class="devbar"><span class="tag">DEV</span><h2>Panel edycji</h2><span class="status" id="status"></span>' +
      '<div class="acts"><a class="b" href="' + (BASE || './') + '" target="_blank" rel="noopener">Zobacz stronę</a>' +
      '<button class="b" data-a="discard" id="btn-discard">Odrzuć zmiany</button><button class="b primary" data-a="export" id="btn-export">Pobierz zmiany (.zip)</button></div></div>' +
      '<p class="hint howto">Po edycji kliknij <b>Pobierz zmiany</b>, rozpakuj paczkę do folderu strony (podmieni <code>gallery.json</code> i doda nowe zdjęcia do <code>images/</code>) i wrzuć folder na hosting.</p>' +
      '<div class="devgrid"><div class="editor">' +
        '<section class="sec"><h3>Nagłówek</h3>' + fl('header.title','Tytuł',h.title) + '<div class="two">' + fl('header.eyebrow','Etykieta lewa',h.eyebrow) + fl('header.eyebrow2','Etykieta prawa',h.eyebrow2) + '</div>' + fl('header.lead','Opis',h.lead) + '</section>' +
        '<section class="sec"><h3>Blok technik</h3>' + fl('techs.label','Etykieta',t.label) +
          '<label class="fl">Lista (jedna pozycja w linii)<textarea id="f-techs-items" data-path="techs.items">' + esc(t.items.join('\n')) + '</textarea></label>' + fl('techs.note','Dopisek na dole',t.note) + '</section>' +
        '<section class="sec"><h3>Kafelki <em id="holes"></em></h3>' +
          '<p class="hint">Kolejność na liście to kolejność w siatce. Duże kafelki wypełniają wolne miejsca automatycznie.</p>' +
          '<div class="addrow"><button class="b" data-a="upload-new">Dodaj zdjęcia</button><button class="b" data-a="add-art">Dodaj przykładowy kafelek</button></div>' +
          '<div class="list" id="list"></div></section>' +
      '</div><div class="preview"><div class="pv-label"><span>Podgląd na żywo</span><span>Paski = wolne pola</span></div><div class="pv" id="pv"></div></div></div>';
    renderList(); refreshPreview(); updateStatus();
  }

  function renderList(){
    var el = document.getElementById('list'); if (!el) return;
    var n = state.items.length;
    el.innerHTML = state.items.map(function(it, i){
      var mv = '<button class="b sm" data-a="up" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Wyżej">↑</button><button class="b sm" data-a="down" data-i="' + i + '"' + (i === n - 1 ? ' disabled' : '') + ' aria-label="Niżej">↓</button>';
      if (it.type === 'title' || it.type === 'techs') {
        return '<div class="row text"><div class="thumb block' + (it.type === 'techs' ? ' r' : '') + '">' + (it.type === 'title' ? 'Nagłówek' : 'Techniki') + '</div><div class="rf"><span class="lbl">' + (it.type === 'title' ? 'Blok nagłówka' : 'Blok technik') + '</span><span class="sub">3 × 2 · treść edytujesz wyżej</span><div class="ctl">' + mv + '</div></div></div>';
      }
      var cropOpen = !!openCrop[it.id];
      var sizes = [1,2,3].map(function(s){ return '<option value="' + s + '"' + ((+it.size || 1) === s ? ' selected' : '') + '>' + s + ' × ' + s + '</option>'; }).join('');
      var srcOpts = (it.src ? '<option value="__own" selected>Własne zdjęcie</option>' : '') +
        Object.keys(ARTS).map(function(k){ return '<option value="' + k + '"' + (!it.src && it.art === k ? ' selected' : '') + '>Przykład: ' + ART_NAMES[k] + '</option>'; }).join('');
      return '<div class="row"><img class="thumb" src="' + esc(imgSrc(it)) + '" alt="" style="object-position:' + fx(it) + '% ' + fy(it) + '%">' +
        '<div class="rf"><input type="text" id="t-' + it.id + '" data-i="' + i + '" data-k="title" value="' + esc(it.title) + '" placeholder="Nazwa, np. Klasyczna czerwień" aria-label="Nazwa">' +
        '<div class="meta3"><input type="text" id="m-' + it.id + '" data-i="' + i + '" data-k="meta" value="' + esc(it.meta) + '" placeholder="Technika · kształt" aria-label="Technika i kształt">' +
        '<select id="s-' + it.id + '" data-i="' + i + '" data-k="size" aria-label="Rozmiar">' + sizes + '</select></div>' +
        '<div class="ctl"><select id="src-' + it.id + '" data-i="' + i + '" data-k="art" aria-label="Zdjęcie">' + srcOpts + '</select>' +
        '<button class="b sm" data-a="upload" data-i="' + i + '">Wgraj zdjęcie</button>' + mv +
        '<button class="b sm' + (cropOpen ? ' on' : '') + '" data-a="crop" data-i="' + i + '" aria-expanded="' + cropOpen + '">Kadr</button>' +
        '<button class="b sm del" data-a="remove" data-i="' + i + '">Usuń</button></div>' +
        (cropOpen ? '<div class="crop"><span class="sub">Kliknij na zdjęciu miejsce, które ma być widoczne w kafelku.</span><div class="crop-wrap">' +
          '<span class="pick"><img src="' + esc(imgSrc(it)) + '" alt="" data-pick="' + i + '"><span class="dot" style="left:' + fx(it) + '%;top:' + fy(it) + '%"></span></span>' +
          '<div class="crop-side"><img class="crop-prev" src="' + esc(imgSrc(it)) + '" alt="Podgląd kadru" style="' + fitStyle(it) + ';transform:scale(' + fz(it) + ')">' +
          '<label class="fl">Przybliżenie<input type="range" id="z-' + it.id + '" min="1" max="2.5" step="0.05" value="' + fz(it) + '" data-i="' + i + '" data-k="zoom"></label>' +
          '<button class="b sm" data-a="center" data-i="' + i + '">Wyśrodkuj</button></div></div></div>' : '') +
        '</div></div>';
    }).join('');
  }

  var pvT;
  function refreshPreview(){
    clearTimeout(pvT);
    pvT = setTimeout(function(){
      var pv = document.getElementById('pv'); if (!pv) return;
      pv.innerHTML = galleryHtml(state, true); markReady(pv); if (!pv._bound) { bindTiles(pv, {get items(){ return state.items; }}); pv._bound = 1; }
      var holes = pack(state.items, 6).holes.length, hEl = document.getElementById('holes');
      if (hEl) { hEl.textContent = holes ? 'Wolne pola: ' + holes : 'Siatka pełna'; hEl.className = holes ? 'warn' : ''; }
    }, 120);
  }
  function updateStatus(){
    var s = document.getElementById('status'); if (!s) return;
    s.textContent = dirty ? 'Niezapisane zmiany' : 'Bez zmian';
    s.className = 'status' + (dirty ? ' dirty' : '');
    var ds = document.getElementById('btn-discard'); if (ds) ds.disabled = !dirty;
  }
  function change(structural){ dirty = true; if (structural) renderList(); refreshPreview(); updateStatus(); }

  root.addEventListener('input', function(e){
    if (!state) return;
    var el = e.target, path = el.getAttribute('data-path');
    if (path) {
      var parts = path.split('.');
      state[parts[0]][parts[1]] = parts[1] === 'items' ? el.value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean) : el.value;
      return change(false);
    }
    var k = el.getAttribute('data-k'), it = state.items[+el.getAttribute('data-i')];
    if (!it || !k) return;
    if (k === 'size') { it.size = +el.value; return change(false); }
    if (k === 'zoom') { it.zoom = +el.value; var cp = el.closest('.crop'); if (cp) cp.querySelector('.crop-prev').style.transform = 'scale(' + it.zoom + ')'; return change(false); }
    if (k === 'art') { if (el.value === '__own') return; it.art = el.value; it.src = ''; return change(true); }
    it[k] = el.value; change(false);
  });

  root.addEventListener('click', function(e){
    if (!state) return;
    var pk = e.target.closest('[data-pick]');
    if (pk) {
      var pit = state.items[+pk.getAttribute('data-pick')], rc = pk.getBoundingClientRect();
      if (pit && rc.width && rc.height) {
        pit.fx = Math.round(Math.max(0, Math.min(100, (e.clientX - rc.left) / rc.width * 100)));
        pit.fy = Math.round(Math.max(0, Math.min(100, (e.clientY - rc.top) / rc.height * 100)));
        change(true);
      }
      return;
    }
    var b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    var a = b.getAttribute('data-a'), i = +b.getAttribute('data-i'), list = state.items;
    if (a === 'export') exportZip(b);
    else if (a === 'discard') {
      if (b.getAttribute('data-c') !== '1') { b.setAttribute('data-c','1'); b.textContent = 'Na pewno odrzucić?'; return; }
      state = clone(saved); dirty = false; showDev();
    }
    else if (a === 'up' && i > 0) { list.splice(i - 1, 0, list.splice(i, 1)[0]); change(true); }
    else if (a === 'down' && i < list.length - 1) { list.splice(i + 1, 0, list.splice(i, 1)[0]); change(true); }
    else if (a === 'remove') {
      if (b.getAttribute('data-c') !== '1') { b.setAttribute('data-c','1'); b.textContent = 'Na pewno?'; return; }
      list.splice(i, 1); change(true);
    }
    else if (a === 'crop') { var cid = list[i].id; openCrop[cid] = !openCrop[cid]; renderList(); }
    else if (a === 'center') { list[i].fx = 50; list[i].fy = 50; list[i].zoom = 1; change(true); }
    else if (a === 'add-art') { var keys = Object.keys(ARTS), k = keys[list.length % keys.length]; list.push({id:uid(), type:'photo', size:1, title:ART_NAMES[k], meta:'', art:k, src:''}); change(true); }
    else if (a === 'upload') { pickFor = i; fileIn.multiple = false; fileIn.click(); }
    else if (a === 'upload-new') { pickFor = -1; fileIn.multiple = true; fileIn.click(); }
  });

  /* ---------- local uploads (kept in memory until exported) ---------- */
  var pickFor = -1;
  var fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.hidden = true; fileIn.id = 'file-in';
  document.body.appendChild(fileIn);
  fileIn.addEventListener('change', function(){ handleFiles(fileIn.files, pickFor); fileIn.value = ''; });
  function shrink(file){
    return new Promise(function(done){
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return done(file);
      createImageBitmap(file, {imageOrientation:'from-image'}).then(function(bmp){
        var s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
        var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); if (bmp.close) bmp.close();
        c.toBlob(function(b){ done(b || file); }, 'image/jpeg', .86);
      }, function(){ done(file); });
    });
  }
  function slug(name){ return (name || 'zdjecie').toLowerCase().replace(/\.[a-z0-9]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g,'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'zdjecie'; }
  function handleFiles(files, target){
    var arr = Array.prototype.filter.call(files || [], function(f){ return /^image\//.test(f.type); });
    if (!arr.length) return;
    var targetItem = target >= 0 ? state.items[target] : null;
    Promise.all(arr.map(function(f){ return shrink(f).then(function(blob){ return {f:f, blob:blob}; }); })).then(function(rs){
      rs.forEach(function(r){
        var path = 'images/' + slug(r.f.name) + '-' + uid().slice(0, 4) + '.jpg';
        uploads[path] = r.blob; blobUrls[path] = URL.createObjectURL(r.blob);
        if (targetItem) { targetItem.src = path; targetItem.art = ''; targetItem.fx = 50; targetItem.fy = 50; targetItem.zoom = 1; }
        else state.items.push({id:uid(), type:'photo', size:1, title:'', meta:'', art:'', src:path});
      });
      change(true);
      toast('Dodano zdjęcia: ' + rs.length + '. Pamiętaj, żeby na koniec pobrać zmiany.', 4500);
    });
  }

  /* ---------- export ---------- */
  function exportZip(btn){
    if (!window.JSZip) { toast('Nie udało się wczytać modułu ZIP. Sprawdź połączenie z internetem.', 5000); return; }
    var zip = new JSZip(), used = {};
    state.items.forEach(function(it){ if (it.src) used[it.src] = 1; });
    zip.file('gallery.json', JSON.stringify(state, null, 2));
    var n = 0;
    Object.keys(uploads).forEach(function(p){ if (used[p]) { zip.file(p, uploads[p]); n++; } });
    btn.disabled = true;
    var json = JSON.stringify(state);
    fetch(BASE + 'index.html', {cache: 'no-cache'}).then(function(r){ return r.ok ? r.text() : null; }).catch(function(){ return null; }).then(function(html){
      if (html && html.indexOf('id="gallery-data"') > -1) {
        zip.file('index.html', html.replace(/(<script type="application\/json" id="gallery-data">)[\s\S]*?(<\/script>)/, function(m, a, b){ return a + json.replace(/</g, '\\u003c') + b; }));
      }
      return zip.generateAsync({type:'blob'});
    }).then(function(blob){
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'galeria-zmiany.zip';
      document.body.appendChild(a); a.click(); a.remove();
      saved = clone(state); dirty = false; updateStatus();
      toast('Pobrano paczkę: gallery.json' + (n ? ' + ' + n + ' zdjęć' : '') + '. Rozpakuj ją do folderu strony.', 6000);
    }, function(){ toast('Nie udało się utworzyć paczki.'); }).then(function(){ btn.disabled = false; });
  }
  window.addEventListener('beforeunload', function(e){ if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- PIN gate ---------- */
  var PIN_HASH = '9d29b789b1e8a168cdaefbc654985e8b8709f8b2914019d78cc23f8f914fcbb4';
  var PIN_SALT = 'galeria-dev:';
  function start(){ load().then(function(d){ saved = d; state = clone(d); showDev(); }); }
  function sha256(text){
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function unlocked(){ try { return sessionStorage.getItem('devUnlocked') === PIN_HASH; } catch(e) { return false; } }
  function showPin(){
    root.innerHTML = '<form class="pin" id="pin-form" autocomplete="off" novalidate>' +
      '<span class="tag">DEV</span><h2>Panel edycji</h2><p class="hint">Wpisz PIN, żeby wejść.</p>' +
      '<input id="pin-in" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" aria-label="PIN" autofocus>' +
      '<button class="b primary" type="submit">Wejdź</button><p class="pin-err" id="pin-err" role="alert"></p></form>';
    var form = document.getElementById('pin-form'), inp = document.getElementById('pin-in'), err = document.getElementById('pin-err');
    var fails = 0, lockUntil = 0;
    inp.focus();
    inp.addEventListener('input', function(){ inp.value = inp.value.replace(/\D/g, '').slice(0, 4); err.textContent = ''; if (inp.value.length === 4) check(); });
    form.addEventListener('submit', function(e){ e.preventDefault(); check(); });
    function check(){
      var now = Date.now();
      if (now < lockUntil) { err.textContent = 'Za dużo prób. Spróbuj za ' + Math.ceil((lockUntil - now) / 1000) + ' s.'; return; }
      if (inp.value.length !== 4) { err.textContent = 'PIN ma 4 cyfry.'; return; }
      if (!window.crypto || !crypto.subtle) { err.textContent = 'Otwórz panel przez https, żeby wpisać PIN.'; return; }
      sha256(PIN_SALT + inp.value).then(function(h){
        if (h === PIN_HASH) { try { sessionStorage.setItem('devUnlocked', PIN_HASH); } catch(e) {} start(); return; }
        fails++; inp.value = ''; form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
        if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; err.textContent = 'Za dużo prób. Spróbuj za 30 s.'; }
        else err.textContent = 'Zły PIN.';
        inp.focus();
      });
    }
  }
  if (unlocked()) start(); else showPin();

})();

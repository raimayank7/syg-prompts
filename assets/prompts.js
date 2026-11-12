/* prompts.shareyourgroup.com: search across every prompt on the home page. Runs in the browser; nothing typed is sent anywhere. */
(function () {
  'use strict';
  var d = document, q = d.getElementById('pq'), out = d.getElementById('pq-out'), cnt = d.getElementById('pq-n');
  if (!q) return;
  var DATA = null, timer = null;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function show() {
    var words = q.value.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!words.length) { out.innerHTML = ''; cnt.textContent = ''; return; }
    var hits = DATA.map(function (p) {
      var name = (p.n + ' ' + p.t).toLowerCase(), text = p.x.toLowerCase(), score = 0;
      for (var i = 0; i < words.length; i++) {
        if (name.indexOf(words[i]) >= 0) score += 3; else if (text.indexOf(words[i]) >= 0) score += 1; else return null;
      }
      return { p: p, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; });
    cnt.textContent = hits.length ? hits.length + (hits.length === 1 ? ' prompt found' : ' prompts found') + (hits.length > 12 ? ', showing the first 12' : '') : 'No prompt has all of those words. Try one shorter word.';
    out.innerHTML = hits.slice(0, 12).map(function (h) {
      var p = h.p, shown = esc(p.x).replace(/\[((?:[A-Z0-9 ,\/?.:()'-]|&quot;)+)\]/g, '<mark>[$1]</mark>');
      return '<div class="pr"><p class="ph">' + esc(p.n) + ' <a href="' + p.u + '">' + esc(p.t) + '</a></p><pre class="pt">' + shown + '</pre><p class="pa"><button class="btn sm" type="button" data-copy="' + esc(p.x) + '" data-done="Prompt copied">Copy prompt</button></p></div>';
    }).join('');
  }
  function load() {
    if (DATA) return show();
    fetch('/data/prompts.json').then(function (r) { return r.json(); }).then(function (j) { DATA = j; show(); })
      .catch(function () { cnt.textContent = 'The search list could not load. Check your connection and try again.'; });
  }
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(load, 150); });
  if (/^#q=/.test(location.hash)) { q.value = decodeURIComponent(location.hash.slice(3)); load(); }
})();

/* ─────────────────────────────────────────────────────────────────────────────
   Hero pool picker (STAR-166, operator hero decision 2026-10-24). Source:
   brand/heroes/hero-pool.js; every site gets a byte copy from check-drift --write.

   A classic script, loaded synchronously straight after its hero art box, so it
   runs while the page is still parsing and before the art region is painted.
   Same-origin file, no inline code: works under CSP script-src 'self'.

   Markup contract (the box keeps every layout rule it had, so nothing shifts):
     <div class="…-art" data-hero-pool='[{"id","kind","width","height","widths"}…]'
          data-hero-base="/heroes/<site>/" data-hero-sizes="(min-width: 900px) 50vw, 100vw">
       <noscript>…a <picture> of the first entry…</noscript>
       <template data-hero-id="opus"><svg class="fleet-art …">…</svg></template>
     </div>
     <script src="/heroes/hero-pool.js"></script>

   One entry is picked at random on every load; ?hero=<id> forces one (the
   staging switcher uses this). A raster entry becomes a <picture> with AVIF and
   WebP sources at every built width; an SVG entry is cloned from its <template>,
   so the drawing stays inline and keeps its currentColor roles and finite
   motion. The chosen id lands in data-hero-pick. No JS: <noscript> shows the
   first entry.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
	'use strict';
	var forced = null;
	try {
		forced = new URLSearchParams(location.search).get('hero');
	} catch (e) {
		/* very old browser: random only */
	}

	function picture(base, e, sizes) {
		var p = document.createElement('picture');
		['avif', 'webp'].forEach(function (fmt) {
			var s = document.createElement('source');
			s.type = 'image/' + fmt;
			s.srcset = e.widths.map(function (w) { return base + e.id + '-' + w + '.' + fmt + ' ' + w + 'w'; }).join(', ');
			s.sizes = sizes;
			p.appendChild(s);
		});
		var img = document.createElement('img');
		img.className = 'hero-raster';
		img.alt = '';
		img.width = e.width;
		img.height = e.height;
		img.decoding = 'async';
		img.setAttribute('fetchpriority', 'high');
		img.src = base + e.id + '-' + e.widths[e.widths.length - 1] + '.webp';
		p.appendChild(img);
		return p;
	}

	function pick(box) {
		var pool;
		try {
			pool = JSON.parse(box.getAttribute('data-hero-pool'));
		} catch (e) {
			return;
		}
		var tpl = function (id) { return box.querySelector('template[data-hero-id="' + id + '"]'); };
		// An SVG entry is only usable when its inline drawing is on the page.
		pool = (pool || []).filter(function (e) { return e.kind !== 'svg' || tpl(e.id); });
		if (!pool.length) return;
		var e = pool.filter(function (x) { return x.id === forced; })[0] || pool[Math.floor(Math.random() * pool.length)];
		var node = e.kind === 'svg'
			? tpl(e.id).content.cloneNode(true)
			: picture(box.getAttribute('data-hero-base') || '', e, box.getAttribute('data-hero-sizes') || '100vw');
		box.setAttribute('data-hero-pick', e.id);
		box.appendChild(node);
	}

	var boxes = document.querySelectorAll('[data-hero-pool]:not([data-hero-pick])');
	for (var i = 0; i < boxes.length; i++) pick(boxes[i]);
})();

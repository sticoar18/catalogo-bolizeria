(function () {
        var run=function JCRuntime(C) {
          var d = document;
          var root = d.getElementById(C.id);
          if (!root || root.getAttribute('data-jc-on') === '1') return;
          root.setAttribute('data-jc-on', '1');
          function lt(a, b) { return Math.min(a, b) === a && a !== b; }
          function gt(a, b) { return Math.max(a, b) === a && a !== b; }
          function gte(a, b) { return Math.max(a, b) === a; }
          function qa(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }
          function jc(name, ctx) { return (ctx || root).querySelector('[data-jc="' + name + '"]'); }
          function pad(n) { return (lt(n, 10) ? '0' : '') + n; }
          function enc(s) { return encodeURIComponent(s); }
          function norm(s) {
            s = String(s || '').toLowerCase();
            if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return s;
          }
          function fmt(n) {
            var f = Math.round(n * 100) / 100;
            var s = (Math.round(f) === f) ? String(f) : f.toFixed(2);
            var p = s.split('.');
            var ip = p[0], out = '';
            while (gt(ip.length, 3)) { out = C.t + ip.slice(-3) + out; ip = ip.slice(0, -3); }
            out = ip + out;
            return C.cur + ' ' + (p.length === 2 ? out + C.d + p[1] : out);
          }
          function hdUrl(u) {
            if (!u || u.indexOf('data:') === 0) return u;
            return u.replace(/([?&]w=)\d+/, function (m, a) { return a + '1400'; }).replace(/=w\d+$/, '=w1600');
          }
          function roleOf(t, stop) {
            while (t && t !== stop && t !== d) {
              var r = t.getAttribute && t.getAttribute('data-jc');
              if (r) return { r: r, el: t };
              t = t.parentNode;
            }
            return { r: null, el: null };
          }
          qa('[data-jc-owner="' + C.id + '"]', d.body).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
          var ov = jc('ov'), lb = jc('lb'), bar = jc('bar'), toastEl = jc('toast'), wa = jc('wa'), sh = jc('sh');
          [ov, lb, bar, toastEl, wa, sh].forEach(function (n) {
              if (!n) return;
              n.setAttribute('data-jc-owner', C.id);
              d.body.appendChild(n);
          });
          function show(el, disp) { if (el) el.style.display = disp || 'block'; }
          function hide(el) { if (el) el.style.display = 'none'; }
          var toastTimer = null;
          function toast(msg) {
            if (!toastEl) return;
            toastEl.textContent = msg;
            show(toastEl, 'block');
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(function () { hide(toastEl); }, 2800);
          }
          var lockCount = 0, prevOverflow = '';
          function lockScroll(on) {
            if (on) { if (lockCount === 0) { prevOverflow = d.body.style.overflow; d.body.style.overflow = 'hidden'; } lockCount = lockCount + 1; }
            else if (gt(lockCount, 0)) { lockCount = lockCount - 1; if (lockCount === 0) d.body.style.overflow = prevOverflow; }
          }
          function copy(text, okMsg) {
            function fb() {
              var ta = d.createElement('textarea');
              ta.value = text; ta.setAttribute('readonly', '');
              ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
              d.body.appendChild(ta); ta.select();
              var ok = false;
              try { ok = d.execCommand('copy'); } catch (e) {}
              d.body.removeChild(ta);
              toast(ok ? okMsg : 'No se pudo copiar automáticamente: ' + text);
            }
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fb); return; }
            } catch (e0) {}
            fb();
          }
          function guardImg(im) {
            if (!im || im.getAttribute('data-jc-g') === '1') return;
            im.setAttribute('data-jc-g', '1');
            if (im.getAttribute('data-jc') === 'sico') {
              var toEmoji = function () {
                if (!im.parentNode) return;
                var sp = d.createElement('span');
                sp.setAttribute('aria-hidden', 'true');
                sp.textContent = im.getAttribute('data-emo') || '';
                im.parentNode.replaceChild(sp, im);
              };
              im.addEventListener('error', toEmoji);
              if (im.complete && im.getAttribute('src') && im.naturalWidth === 0 && im.getAttribute('loading') !== 'lazy') toEmoji();
              return;
            }
            function swap() {
              if (im.getAttribute('data-jc-ph') === '1') return;
              im.setAttribute('data-jc-ph', '1');
              im.removeAttribute('srcset');
              im.src = C.ph;
            }
            im.addEventListener('error', swap);
            if (im.complete && im.getAttribute('src') && im.naturalWidth === 0) swap();
          }
          qa('img').forEach(guardImg);
          if (sh) qa('img', sh).forEach(guardImg);
          if (wa) qa('img', wa).forEach(guardImg);
          var cards = qa('[data-jc="card"]');
          var rows = qa('[data-jc="row"]');
          cards.forEach(function (c) { c.__d = c.style.display; });
          rows.forEach(function (r) { r.__d = r.style.display; });
          function cardOf(el) {
            while (el && el !== root && el !== d.body) { if (el.getAttribute && el.getAttribute('data-jc') === 'card') return el; el = el.parentNode; }
            return null;
          }
          function capOf(card) {
            var mx = parseInt(card.getAttribute('data-stock'), 10);
            return (!isNaN(mx) && gt(mx, 0)) ? Math.min(99, mx) : 99;
          }
          function cardQty(card) {
            var qv = jc('qv', card);
            var n = parseInt(qv ? qv.value : '1', 10);
            if (isNaN(n) || lt(n, 1)) n = 1;
            return Math.min(n, capOf(card));
          }
          function cardVar(card) {
            var sel = jc('var', card);
            if (sel) {
              var o = sel.options[sel.selectedIndex];
              return { i: sel.selectedIndex, n: o.getAttribute('data-vn') || '', o: Number(o.getAttribute('data-o')), r: Number(o.getAttribute('data-r')) };
            }
            return { i: 0, n: card.getAttribute('data-vn') || '', o: Number(card.getAttribute('data-o')), r: Number(card.getAttribute('data-r')) };
          }
          function refreshCard(card) {
            var v = cardVar(card), q = cardQty(card);
            var hasDisc = gt(v.r, v.o) && gt(v.o, 0);
            qa('[data-jc="off"]', card).forEach(function (el) { el.textContent = fmt(v.o); });
            qa('[data-jc="reg"]', card).forEach(function (el) { el.textContent = hasDisc ? fmt(v.r) : ''; el.style.display = hasDisc ? '' : 'none'; });
            qa('[data-jc="save"]', card).forEach(function (el) { el.textContent = hasDisc ? 'Ahorras ' + fmt(v.r - v.o) : ''; el.style.display = hasDisc ? '' : 'none'; });
            qa('[data-jc="pct"]', card).forEach(function (el) { el.textContent = hasDisc ? ('-' + Math.round((v.r - v.o) / v.r * 100) + '%') : ''; el.style.display = hasDisc ? '' : 'none'; });
            var sub = jc('sub', card);
            if (sub) {
              if (gt(q, 1)) { sub.textContent = 'Subtotal (' + q + ' u.): ' + fmt(v.o * q); sub.style.display = 'block'; }
              else { sub.textContent = ''; sub.style.display = 'none'; }
            }
          }
          var cart = [];
          try { var raw = sessionStorage.getItem(C.sk); if (raw) cart = JSON.parse(raw); } catch (e1) { cart = []; }
          if (!Array.isArray(cart)) cart = [];
          cart = cart.filter(function (it) {
              var c = cards[it.ci];
              return c && c.getAttribute('data-n') === it.n && gt(Number(it.u), 0) && gt(Number(it.q), 0);
          });
          var cpOn = false;
          try { cpOn = !!C.cp && sessionStorage.getItem(C.sk + '_cp') === C.cp.code; } catch (e2) {}
          function saveCart() {
            try {
              sessionStorage.setItem(C.sk, JSON.stringify(cart));
              if (cpOn && C.cp) sessionStorage.setItem(C.sk + '_cp', C.cp.code); else sessionStorage.removeItem(C.sk + '_cp');
            } catch (e3) {}
          }
          function shipFor(sub) {
            var s = C.ship;
            if (s.m === 'free') return 0;
            if (s.m === 'flat') return s.c;
            if (s.m === 'free_over') return gte(sub, s.f) ? 0 : s.c;
            return null;
          }
          function totals() {
            var sub = 0, count = 0;
            cart.forEach(function (it) { sub = sub + it.u * it.q; count = count + it.q; });
            var disc = 0, cpShort = false;
            if (cpOn && C.cp && gt(sub, 0)) {
              if (gte(sub, C.cp.min)) disc = Math.round(sub * C.cp.pct) / 100;
              else cpShort = true;
            }
            var ship = shipFor(sub);
            return { sub: sub, count: count, disc: disc, cpShort: cpShort, ship: ship, total: sub - disc + (ship === null ? 0 : ship) };
          }
          function shipText(t) {
            if (t.ship === null) return 'A convenir (te lo confirmamos por WhatsApp)';
            return t.ship === 0 ? 'Gratis 🝉' : fmt(t.ship);
          }
          var itemsBox = jc('items', ov), proto = jc('proto', ov);
          var protoDisp = proto ? proto.style.display : '';
          if (proto && proto.parentNode) proto.parentNode.removeChild(proto);
          var viewForm = jc('view-form', ov), viewOk = jc('view-ok', ov);
          function cardThumb(ci) {
            var c = cards[ci];
            var im = c ? jc('slide', c) : null;
            return im ? (im.currentSrc || im.src) : '';
          }
          function renderCart() {
            var t = totals();
            var open = ov && ov.style.display === 'flex';
            if (bar) {
              var visible = gt(cart.length, 0) && C.mode === 'cart' && !open;
              bar.style.display = visible ? 'block' : 'none';
              var bn = jc('bn', bar), bt = jc('bt', bar);
              if (bn) bn.textContent = '🛒 Ver mi pedido (' + t.count + ')';
              if (bt) bt.textContent = fmt(t.total - (t.ship === null ? 0 : t.ship));
            }
            if (wa && C.wa && C.wa.pos.charAt(0) === 'b') wa.style.bottom = ((bar && bar.style.display === 'block') ? C.wa.off + 76 : C.wa.off) + 'px';
            if (!itemsBox || !proto) return;
            while (itemsBox.firstChild) itemsBox.removeChild(itemsBox.firstChild);
            cart.forEach(function (it, idx) {
                var row = proto.cloneNode(true);
                row.removeAttribute('data-jc');
                row.style.display = protoDisp;
                jc('rn', row).textContent = it.n;
                var rv = jc('rv', row);
                if (rv) { rv.textContent = it.v; rv.style.display = it.v ? 'block' : 'none'; }
                jc('ru', row).textContent = it.q + ' × ' + fmt(it.u) + ' = ' + fmt(it.u * it.q);
                jc('rq', row).textContent = String(it.q);
                var th = jc('rt', row), src = cardThumb(it.ci);
                if (th) { if (src) { th.src = src; guardImg(th); } else th.style.display = 'none'; }
                row.setAttribute('data-idx', String(idx));
                itemsBox.appendChild(row);
            });
            var ss = jc('sumsub', ov), sh2 = jc('sumship', ov), st = jc('sumtot', ov);
            if (ss) ss.textContent = fmt(t.sub);
            if (sh2) sh2.textContent = shipText(t);
            if (st) st.textContent = fmt(t.total) + (t.ship === null ? ' + envío' : '');
            var cpr = jc('cprow', ov);
            if (cpr && C.cp) {
              cpr.style.display = cpOn ? 'flex' : 'none';
              var cl = jc('cplab', cpr), cv = jc('sumdisc', cpr);
              if (cl) cl.textContent = '🝟️ Cupón ' + C.cp.code + ' (-' + C.cp.pct + '%)';
              if (cv) cv.textContent = t.cpShort ? 'Desde ' + fmt(C.cp.min) : '-' + fmt(t.disc);
              var cin = jc('cpwrap', ov);
              if (cin) cin.style.display = cpOn ? 'none' : 'flex';
            }
            var pr = jc('prog', ov);
            if (pr) {
              if (C.ship.m === 'free_over' && gt(C.ship.f, 0) && gt(cart.length, 0)) {
                pr.style.display = 'block';
                var left = C.ship.f - t.sub;
                jc('progtxt', pr).textContent = gt(left, 0) ? ('Te faltan ' + fmt(left) + ' para envío GRATIS 🚚') : '🝉 ¡Tu envío es GRATIS!';
                jc('progfill', pr).style.width = Math.min(100, Math.round(t.sub / C.ship.f * 100)) + '%';
              } else { pr.style.display = 'none'; }
            }
          }
          function addItem(card, qty) {
            var v = cardVar(card);
            if (!gt(v.o, 0)) { toast('Este producto no tiene precio. Escríbenos por WhatsApp.'); return false; }
            var ci = cards.indexOf(card);
            var key = ci + ':' + v.i;
            var cap = capOf(card);
            var found = null;
            cart.forEach(function (it) { if (it.k === key) found = it; });
            if (found) {
              if (gte(found.q, cap)) { toast('Máximo disponible: ' + cap); return false; }
              found.q = Math.min(cap, found.q + qty);
            }
            else cart.push({ k: key, ci: ci, n: card.getAttribute('data-n'), v: v.n, u: v.o, q: Math.min(cap, qty) });
            saveCart();
            renderCart();
            return true;
          }
          function applyCoupon(code, silent) {
            if (!C.cp) return false;
            var c = String(code || '').toUpperCase().replace(/\s+/g, '');
            if (c !== C.cp.code) { if (!silent) toast('Ese cupón no es válido.'); return false; }
            cpOn = true; saveCart(); renderCart();
            if (!silent) toast('🝉 Cupón ' + C.cp.code + ' aplicado: -' + C.cp.pct + '%');
            return true;
          }
          var lastFocus = null;
          function openOrder() {
            if (!ov) return;
            hide(toastEl);
            if (viewOk) hide(viewOk);
            if (viewForm) show(viewForm, 'block');
            lastFocus = d.activeElement;
            show(ov, 'flex');
            lockScroll(true);
            renderCart();
            var fine = false;
            try { fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches; } catch (e4) {}
            var mc = jc('close', ov);
            setTimeout(function () { try { (fine && gt(cart.length, 0) ? jc('f-name', ov) : mc).focus(); } catch (e5) {} }, 60);
          }
          function closeOrder() {
            if (!ov || ov.style.display !== 'flex') return;
            hide(ov);
            lockScroll(false);
            renderCart();
            try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e6) {}
          }
          function flashBtn(btn, txt) {
            if (btn.getAttribute('data-busy') === '1') return;
            var old = btn.textContent;
            btn.setAttribute('data-busy', '1');
            btn.textContent = txt;
            setTimeout(function () { btn.textContent = old; btn.removeAttribute('data-busy'); }, 1300);
          }
          var lbImgs = [], lbIdx = 0;
          function lbShow() {
            var im = jc('lbimg', lb);
            if (!im) return;
            im.src = lbImgs[lbIdx];
            var multi = gt(lbImgs.length, 1);
            var p = jc('lbp', lb), n = jc('lbn', lb), c = jc('lbc', lb);
            if (p) p.style.display = multi ? 'flex' : 'none';
            if (n) n.style.display = multi ? 'flex' : 'none';
            if (c) c.textContent = multi ? (lbIdx + 1) + ' / ' + lbImgs.length : '';
            if (multi) { var nx = new Image(); nx.src = lbImgs[(lbIdx + 1) % lbImgs.length]; }
          }
          function lbOpen(card, idx) {
            if (!lb) return;
            lbImgs = qa('[data-jc="slide"]', card).map(function (i) {
                if (i.getAttribute('data-jc-ph') === '1') return i.src;
                return hdUrl(i.getAttribute('data-full') || i.currentSrc || i.src);
            });
            if (lbImgs.length === 0) return;
            lbIdx = Math.min(idx || 0, lbImgs.length - 1);
            lbShow();
            show(lb, 'flex');
            lockScroll(true);
          }
          function lbClose() { if (lb && lb.style.display === 'flex') { hide(lb); lockScroll(false); } }
          function lbStep(dir) { lbIdx = (lbIdx + dir + lbImgs.length) % lbImgs.length; lbShow(); }
          if (lb) {
            guardImg(jc('lbimg', lb));
            var tx = 0;
            lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
            lb.addEventListener('touchend', function (e) {
                var dx = e.changedTouches[0].clientX - tx;
                if (gt(Math.abs(dx), 50) && gt(lbImgs.length, 1)) lbStep(gt(dx, 0) ? -1 : 1);
              }, { passive: true });
            lb.addEventListener('click', function (e) {
                var r = roleOf(e.target, lb).r;
                if (e.target === lb || r === 'lbx') lbClose();
                else if (r === 'lbp') lbStep(-1);
                else if (r === 'lbn') lbStep(1);
            });
          }
          function baseUrl() {
            if (C.url) return C.url;
            var h = String(location.href || '');
            if (!/^https?:/i.test(h)) return '';
            return h.split('#')[0].split('?')[0];
          }
          var shCur = { text: '', url: '', img: '' };
          function openShare(text, url, img, title) {
            if (!sh) return;
            shCur = { text: text, url: url, img: img || '' };
            var t = jc('shtitle', sh), p = jc('shtext', sh), nat = sh.querySelector('[data-net="native"]');
            if (t) t.textContent = title || '📤 Compartir';
            if (p) p.textContent = text + (url ? '\n' + url : '');
            if (nat) nat.style.display = (navigator.share ? 'flex' : 'none');
            show(sh, 'flex');
            lockScroll(true);
            var first = jc('shx', sh);
            setTimeout(function () { try { if (first) first.focus(); } catch (e7) {} }, 60);
          }
          function closeShare() { if (sh && sh.style.display === 'flex') { hide(sh); lockScroll(false); } }
          function shareGo(net) {
            var url = shCur.url, text = shCur.text;
            var full = text + (url ? '\n' + url : '');
            var needUrl = net === 'fb' || net === 'li' || net === 'pin';
            if (needUrl && !url) { toast(C.preview ? 'Vista previa: al publicar se compartirá el enlace real de tu catálogo.' : 'Esta red necesita el enlace público del catálogo.'); return; }
            var href = '';
            if (net === 'wa') href = 'https://wa.me/?text=' + enc(full);
            else if (net === 'fb') href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url);
            else if (net === 'tg') href = 'https://t.me/share/url?url=' + enc(url || text) + (url ? '&text=' + enc(text) : '');
            else if (net === 'x') href = 'https://x.com/intent/post?text=' + enc(text) + (url ? '&url=' + enc(url) : '');
            else if (net === 'li') href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url);
            else if (net === 'pin') href = 'https://www.pinterest.com/pin/create/button/?url=' + enc(url) + (shCur.img ? '&media=' + enc(shCur.img) : '') + '&description=' + enc(text);
            else if (net === 'mail') href = 'mailto:?subject=' + enc(C.store) + '&body=' + enc(full);
            else if (net === 'copy') { copy(full, '✔ Copiado. Pégalo donde quieras.'); return; }
            else if (net === 'ig') { copy(full, '✔ Copiado. Abre Instagram o TikTok y pégalo en tu historia, bio o mensaje.'); return; }
            else if (net === 'native') {
              if (navigator.share) {
                var data = { title: C.store, text: text };
                if (url) data.url = url;
                navigator.share(data).then(function () {}, function () {});
              }
              return;
            }
            if (net === 'mail') { location.href = href; return; }
            try { window.open(href, '_blank', 'noopener'); } catch (e8) { location.href = href; }
          }
          if (sh) {
            sh.addEventListener('click', function (e) {
                if (e.target === sh) { closeShare(); return; }
                var ro = roleOf(e.target, sh);
                if (ro.r === 'shclose') closeShare();
                else if (ro.r === 'shx') shareGo(ro.el.getAttribute('data-net'));
            });
          }
          function shareCatalog() {
            openShare('🛍️ ' + C.store + ': mira el catálogo y pide fácil por WhatsApp 👇', baseUrl(), C.img, '📤 Compartir catálogo');
          }
          function shareProduct(card) {
            var v = cardVar(card);
            var im = jc('slide', card);
            var src = im ? (im.getAttribute('data-full') || im.src) : '';
            var b = baseUrl();
            var url = b ? b + '#p-' + card.getAttribute('data-pid') : '';
            openShare('🛍️ ' + card.getAttribute('data-n') + (gt(v.o, 0) ? ' — ' + fmt(v.o) : '') + '\nDisponible en ' + C.store + ' 👇', url, /^https:/.test(src) ? src : '', '📤 Compartir producto');
          }
          var catFilter = '', term = '', sortMode = '';
          function applyFilter() {
            var shown = 0;
            cards.forEach(function (c) {
                var ok = (catFilter === '' || c.getAttribute('data-cat') === catFilter) && (term === '' || c.getAttribute('data-s').indexOf(term) !== -1);
                c.style.display = ok ? c.__d : 'none';
                if (ok) shown = shown + 1;
            });
            rows.forEach(function (r) {
                var any = qa('[data-jc="card"]', r).some(function (c) { return c.style.display !== 'none'; });
                r.style.display = any ? r.__d : 'none';
            });
            var em = jc('empty');
            if (em) em.style.display = shown === 0 ? 'block' : 'none';
          }
          function paintChips() {
            qa('[data-jc="chip"]').forEach(function (b) {
                var on = b.getAttribute('data-cat') === catFilter;
                b.style.background = on ? b.getAttribute('data-on-bg') : b.getAttribute('data-off-bg');
                b.style.color = on ? b.getAttribute('data-on-fg') : b.getAttribute('data-off-fg');
                b.style.borderColor = on ? b.getAttribute('data-on-bg') : b.getAttribute('data-off-bd');
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
          }
          function applySort() {
            var groups = [];
            cards.forEach(function (c) { if (groups.indexOf(c.parentNode) === -1) groups.push(c.parentNode); });
            function key(c) {
              if (sortMode === 'pa') return Number(c.getAttribute('data-p')) || 0;
              if (sortMode === 'pd') return -(Number(c.getAttribute('data-p')) || 0);
              if (sortMode === 'disc') return -(Number(c.getAttribute('data-pc')) || 0);
              return Number(c.getAttribute('data-i'));
            }
            groups.forEach(function (g) {
                var list = cards.filter(function (c) { return c.parentNode === g; });
                list.sort(function (a, b) {
                    var fa = a.getAttribute('data-feat') === '1' ? 0 : 1, fb = b.getAttribute('data-feat') === '1' ? 0 : 1;
                    if (fa !== fb) return fa - fb;
                    if (sortMode === 'az') return String(a.getAttribute('data-n')).localeCompare(String(b.getAttribute('data-n')), 'es');
                    var ka = key(a), kb = key(b);
                    return ka === kb ? Number(a.getAttribute('data-i')) - Number(b.getAttribute('data-i')) : ka - kb;
                });
                list.forEach(function (c) { g.appendChild(c); });
            });
          }
          function setQty(card, n) {
            var qv = jc('qv', card);
            if (!qv) return;
            var cap = capOf(card);
            if (lt(n, 1)) n = 1;
            if (gt(n, cap)) { n = cap; toast('Máximo disponible: ' + cap); }
            qv.value = String(n);
            refreshCard(card);
          }
          root.addEventListener('click', function (e) {
              var ro = roleOf(e.target, root), role = ro.r, t = ro.el;
              if (!role) return;
              var card = cardOf(t);
              if (role === 'qm' && card) setQty(card, cardQty(card) - 1);
              else if (role === 'qp' && card) setQty(card, cardQty(card) + 1);
              else if (role === 'buy' && card) {
                var q = cardQty(card);
                if (C.mode === 'direct') { cart = []; if (addItem(card, q)) openOrder(); }
                else if (addItem(card, q)) { flashBtn(t, '✔ Agregado'); toast('✔ ' + card.getAttribute('data-n') + ' agregado a tu pedido'); }
              }
              else if ((role === 'zoom' || role === 'slide') && card) {
                var slides = qa('[data-jc="slide"]', card), sl0 = jc('slider', card);
                var idx = role === 'slide' ? slides.indexOf(t) : Math.round(sl0.scrollLeft / Math.max(1, sl0.clientWidth));
                lbOpen(card, Math.max(0, idx));
              }
              else if ((role === 'sp' || role === 'sn') && card) {
                var sl = jc('slider', card), dx = (role === 'sp' ? -1 : 1) * sl.clientWidth;
                if (sl.scrollBy) sl.scrollBy({ left: dx, behavior: 'smooth' }); else sl.scrollLeft = sl.scrollLeft + dx;
              }
              else if (role === 'chip') { catFilter = t.getAttribute('data-cat'); paintChips(); applyFilter(); }
              else if (role === 'cta') { var g = jc('grid'); if (g && g.scrollIntoView) { e.preventDefault(); g.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
              else if (role === 'share') { e.preventDefault(); shareCatalog(); }
              else if (role === 'pshare' && card) { e.preventDefault(); shareProduct(card); }
              else if (role === 'cpcopy' && C.cp) { copy(C.cp.code, '🝟️ Cupón ' + C.cp.code + ' copiado y aplicado a tu pedido'); applyCoupon(C.cp.code, true); }
          });
          root.addEventListener('change', function (e) {
              var t = e.target, card = cardOf(t), r = t.getAttribute('data-jc');
              if (r === 'var' && card) refreshCard(card);
              else if (r === 'qv' && card) setQty(card, parseInt(t.value, 10) || 1);
              else if (r === 'sort') { sortMode = t.value; applySort(); }
          });
          root.addEventListener('input', function (e) {
              var t = e.target, r = t.getAttribute('data-jc');
              if (r === 'qv') t.value = t.value.replace(/\D/g, '').slice(0, 2);
              else if (r === 'search') { term = norm(t.value); applyFilter(); }
          });
          qa('[data-jc="slider"]').forEach(function (sl) {
              var card = cardOf(sl), dots = qa('[data-jc="dot"]', card), busy = false;
              if (gt(dots.length, 1)) sl.addEventListener('scroll', function () {
                  if (busy) return;
                  busy = true;
                  requestAnimationFrame(function () {
                      busy = false;
                      var i = Math.round(sl.scrollLeft / Math.max(1, sl.clientWidth));
                      dots.forEach(function (dt, k) { dt.style.width = k === i ? '16px' : '6px'; dt.style.background = k === i ? '#ffffff' : 'rgba(255,255,255,0.55)'; });
                  });
                }, { passive: true });
          });
          if (bar) bar.addEventListener('click', function () { openOrder(); });
          if (ov) {
            ov.addEventListener('click', function (e) {
                if (e.target === ov) { closeOrder(); return; }
                var ro = roleOf(e.target, ov), role = ro.r, t = ro.el;
                if (!role) return;
                if (role === 'close' || role === 'okclose') { closeOrder(); return; }
                if (role === 'cpbtn') { var ci2 = jc('cpin', ov); if (applyCoupon(ci2 ? ci2.value : '')) { if (ci2) ci2.value = ''; } return; }
                if (role === 'cpx') { cpOn = false; saveCart(); renderCart(); toast('Cupón quitado'); return; }
                var row = t;
                while (row && row !== ov && !(row.getAttribute && row.getAttribute('data-idx') !== null)) row = row.parentNode;
                var idx = row && row !== ov ? parseInt(row.getAttribute('data-idx'), 10) : -1;
                if (idx === -1 || !cart[idx]) return;
                if (role === 'rm') { cart[idx].q = cart[idx].q - 1; if (lt(cart[idx].q, 1)) cart.splice(idx, 1); }
                else if (role === 'rp') { var cp = capOf(cards[cart[idx].ci]); if (gte(cart[idx].q, cp)) toast('Máximo disponible: ' + cp); else cart[idx].q = cart[idx].q + 1; }
                else if (role === 'rx') cart.splice(idx, 1);
                saveCart();
                renderCart();
                if (cart.length === 0) closeOrder();
            });
            var cpIn = jc('cpin', ov);
            if (cpIn) cpIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (applyCoupon(cpIn.value)) cpIn.value = ''; } });
            var pays = qa('[data-jc="pay"]', ov);
            function paintPays() {
              var info = jc('payinfo', ov), shown = false;
              pays.forEach(function (lab) {
                  var on = lab.querySelector('input').checked;
                  lab.style.borderColor = on ? lab.getAttribute('data-on-bd') : lab.getAttribute('data-off-bd');
                  lab.style.background = on ? lab.getAttribute('data-on-bg') : 'transparent';
                  if (on && info) {
                    var txt = lab.getAttribute('data-info');
                    info.textContent = txt || '';
                    info.style.display = txt ? 'block' : 'none';
                    shown = true;
                  }
              });
              if (info && !shown) info.style.display = 'none';
            }
            pays.forEach(function (lab) { lab.querySelector('input').addEventListener('change', paintPays); });
            paintPays();
            var form = jc('form', ov), errEl = jc('err', ov), submit = jc('submit', ov);
            function fail(field, msg) {
              if (errEl) { errEl.textContent = '⚠️ ' + msg; errEl.style.display = 'block'; }
              if (field) { field.style.borderColor = '#dc2626'; try { field.focus(); } catch (e9) {} }
              toast(msg);
            }
            function val(name) { var el = jc(name, ov); return el ? el.value.replace(/^\s+|\s+$/g, '') : ''; }
            function payLabel(k) { var r = ''; pays.forEach(function (lab) { if (lab.getAttribute('data-k') === k) r = lab.getAttribute('data-label'); }); return r; }
            function selectedPay() { var k = ''; pays.forEach(function (lab) { if (lab.querySelector('input').checked) k = lab.getAttribute('data-k'); }); return k; }
            function dateStr() { var n = new Date(); return pad(n.getDate()) + '/' + pad(n.getMonth() + 1) + '/' + n.getFullYear() + ' ' + pad(n.getHours()) + ':' + pad(n.getMinutes()); }
            function buildMsg(f, ref, payTxt, t) {
              var L = [];
              L.push('🛒 *NUEVO PEDIDO — ' + String(C.store).toUpperCase() + '*');
              L.push('🆔 Ref: #' + ref + '  ·  📅 ' + dateStr());
              L.push('');
              L.push('📦 *PRODUCTOS*');
              cart.forEach(function (it, i) { L.push((i + 1) + '. ' + it.n + (it.v ? ' (' + it.v + ')' : '') + '\n    ' + it.q + ' × ' + fmt(it.u) + ' = ' + fmt(it.u * it.q)); });
              L.push('');
              L.push('🧾 Subtotal: ' + fmt(t.sub));
              if (gt(t.disc, 0)) L.push('🝟️ Cupón ' + C.cp.code + ' (-' + C.cp.pct + '%): -' + fmt(t.disc));
              L.push('🚚 Envío: ' + (t.ship === null ? 'A convenir' : (t.ship === 0 ? 'Gratis' : fmt(t.ship))));
              L.push('💰 *TOTAL: ' + fmt(t.total) + '*' + (t.ship === null ? ' (+ envío por confirmar)' : ''));
              L.push('');
              L.push('💳 *Pago:* ' + payTxt);
              L.push('');
              L.push('👤 *DATOS DE ENTREGA*');
              L.push('• Nombre: ' + f.name);
              L.push('• Teléfono: ' + f.phone);
              L.push('• Dirección: ' + f.addr);
              L.push('• Barrio: ' + f.barrio);
              if (f.mail) L.push('• Correo: ' + f.mail);
              if (f.note) L.push('• Notas: ' + f.note);
              L.push('');
              L.push('Quedo atento(a) a la confirmación. ¡Gracias!');
              return L.join('\n');
            }
            function showOk(url, text, payUrl) {
              if (viewForm) hide(viewForm);
              if (!viewOk) return;
              show(viewOk, 'block');
              var okm = jc('okmsg', viewOk), okw = jc('okwa', viewOk), okp = jc('okpay', viewOk);
              if (okm) okm.textContent = text;
              if (okw) okw.href = url;
              if (okp) { if (payUrl) { okp.href = payUrl; okp.style.display = 'block'; } else okp.style.display = 'none'; }
              try { var ttl = jc('okwa', viewOk); if (ttl) ttl.focus(); } catch (e10) {}
            }
            function doSubmit() {
              if (errEl) errEl.style.display = 'none';
              ['f-name', 'f-phone', 'f-addr', 'f-barrio', 'f-mail'].forEach(function (n) { var el = jc(n, ov); if (el) el.style.borderColor = ''; });
              if (cart.length === 0) { fail(null, 'Tu pedido está vacío. Agrega al menos un producto.'); return; }
              var f = { name: val('f-name'), phone: val('f-phone'), addr: val('f-addr'), barrio: val('f-barrio'), mail: val('f-mail'), note: val('f-note') };
              var digits = f.phone.replace(/\D/g, '');
              if (lt(f.name.length, 3)) { fail(jc('f-name', ov), 'Escribe tu nombre completo.'); return; }
              if (lt(digits.length, 7) || gt(digits.length, 15)) { fail(jc('f-phone', ov), 'Revisa tu número de teléfono / WhatsApp.'); return; }
              if (lt(f.addr.length, 6)) { fail(jc('f-addr', ov), 'Escribe tu dirección.'); return; }
              if (lt(f.barrio.length, 3)) { fail(jc('f-barrio', ov), 'Escribe tu barrio.'); return; }
              var mailEl = jc('f-mail', ov);
              if (mailEl) {
                var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.mail);
                if (C.email === 'req' && !okMail) { fail(mailEl, 'Escribe un correo válido.'); return; }
                if (C.email === 'opt' && f.mail !== '' && !okMail) { fail(mailEl, 'El correo no parece válido (o déjalo vacío).'); return; }
              }
              var pk = selectedPay();
              if (pk === '') { fail(null, 'Elige un método de pago.'); return; }
              var t = totals();
              var ref = 'PED-' + Math.floor(100000 + Math.random() * 900000);
              var payTxt = payLabel(pk) + (pk === 'online' ? ' (el cliente pagará con el link de pago)' : '');
              var msg = buildMsg(f, ref, payTxt, t);
              try { window.__logPedido && window.__logPedido(ref, f, t, cart.slice(), pk); } catch (eL) {}
              var waUrl = 'https://wa.me/' + C.phone + '?text=' + enc(msg);
              submit.disabled = true;
              setTimeout(function () { submit.disabled = false; }, 1500);
              try { window.open(waUrl, '_blank'); } catch (e11) {}
              cart = [];
              cpOn = false;
              saveCart();
              renderCart();
              var payUrl = pk === 'online' ? C.online : '';
              showOk(waUrl, '¡Listo! Tu pedido ' + ref + ' por ' + fmt(t.total) + ' está preparado. Si WhatsApp no se abrió, toca el botón verde para enviarlo. Tu pedido queda confirmado cuando lo envías por WhatsApp.' + (payUrl ? ' Después puedes pagar en línea con el botón azul.' : ''), payUrl);
            }
            if (form) form.addEventListener('submit', function (e) { e.preventDefault(); doSubmit(); });
          }
          var cdEls = qa('[data-jc="cd"]');
          cdEls.forEach(function (el) { el.__d = el.style.display; });
          if (cdEls.length !== 0 && gt(C.dl, 0)) {
            var tm = null;
            var tick = function () {
              var left = C.dl - Date.now();
              if (!gt(left, 0)) { cdEls.forEach(function (el) { el.style.display = 'none'; }); if (tm) clearInterval(tm); return; }
              var dd = Math.floor(left / 86400000), hh = Math.floor(left / 3600000) % 24, mm = Math.floor(left / 60000) % 60, ss = Math.floor(left / 1000) % 60;
              var txt = (gt(dd, 0) ? dd + 'd ' : '') + pad(hh) + ':' + pad(mm) + ':' + pad(ss);
              cdEls.forEach(function (el) { var s = jc('cdt', el); if (s) s.textContent = txt; el.style.display = el.__d; });
            };
            tick();
            tm = setInterval(tick, 1000);
          } else { cdEls.forEach(function (el) { el.style.display = 'none'; }); }
          function goHash() {
            var h = String(location.hash || '');
            if (h.indexOf('#p-') !== 0) return;
            var pid = h.slice(3), target = null;
            cards.forEach(function (c) { if (c.getAttribute('data-pid') === pid) target = c; });
            if (!target) return;
            catFilter = ''; term = ''; paintChips(); applyFilter();
            var srch = jc('search'); if (srch) srch.value = '';
            var prev = target.style.boxShadow;
            setTimeout(function () {
                if (target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.style.boxShadow = '0 0 0 4px ' + C.acc + ', 0 18px 40px rgba(0,0,0,0.25)';
                setTimeout(function () { target.style.boxShadow = prev; }, 2600);
              }, 120);
          }
          window.addEventListener('hashchange', goHash);
          d.addEventListener('keydown', function (e) {
              if (lb && lb.style.display === 'flex') {
                if (e.key === 'Escape') lbClose();
                else if (e.key === 'ArrowLeft') lbStep(-1);
                else if (e.key === 'ArrowRight') lbStep(1);
              } else if (sh && sh.style.display === 'flex') {
                if (e.key === 'Escape') closeShare();
              } else if (e.key === 'Escape') closeOrder();
          });
          if (wa && C.wa && C.wa.pulse && wa.animate) {
            var calm = false;
            try { calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e12) {}
            if (!calm) {
              try {
                wa.animate([
                    { boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 0 rgba(37,211,102,0.55)' },
                    { boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 16px rgba(37,211,102,0)' }
                  ], { duration: 2000, iterations: Infinity, easing: 'ease-out' });
              } catch (e13) {}
            }
          }
          cards.forEach(function (c) { refreshCard(c); });
          paintChips();
          renderCart();
          goHash();
        };
        var CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vR22lNJrbyNe1YEVOdeXt-z7CUjnNSCq7IwoddkLUh9KYSyZ04vgXtAZo-zt92aUQA7FQ5t8wQmZn1h/pub?gid=0&single=true&output=csv";
        var SCRIPT_URL="https://script.google.com/macros/s/AKfycbwyudszetWXNbOR9qLlpeUu8YvRd0YrusyeBDoWJVTUIvoZtrPkI5HluWS3cAmlrA8/exec";
        var CFG={
          "id": "jcij8957",
          "sk": "jc_cart_jcij8957",
          "phone": "573158866882",
          "cur": "$",
          "t": ".",
          "d": ",",
          "store": "La Bolizeria",
          "mode": "cart",
          "ship": {
            "m": "tbd",
            "c": 0,
            "f": 0
          },
          "email": "opt",
          "dl": 0,
          "cp": null,
          "online": "",
          "url": "",
          "img": "",
          "acc": "#16a34a",
          "ph": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22200%22%20y%3D%22225%22%20font-size%3D%22120%22%20text-anchor%3D%22middle%22%3E%F0%9F%93%A6%3C%2Ftext%3E%3C%2Fsvg%3E",
          "preview": false,
          "wa": {
            "pos": "br",
            "off": 16,
            "pulse": true
          }
        };
        var COMBOS=[{n:6,pct:7,t:"Combo x6 (+7% OFF)"},{n:12,pct:15,t:"Combo x12 Familiar (+15% OFF)"}];
        var esc=function(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
        var cop=function(n){return "$ "+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".")};
        var slug=function(x){return x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};
        function card(p,i){
          var pr=Number(p.precio)||0,st=String(p.stock).trim(),n=st===""?null:parseInt(st,10),ag=n!==null&&n<=0;
          var foto=p.foto||("img/"+slug(p.sabor)+".webp");
          var opts='<option value="0" data-o="'+pr+'" data-r="0" data-vn="1 Unidad">1 Unidad — '+cop(pr)+'</option>';
          COMBOS.forEach(function(c,k){var r=pr*c.n,o=Math.round(r*(1-c.pct/100));opts+='<option value="'+(k+1)+'" data-o="'+o+'" data-r="'+r+'" data-vn="'+c.t+'">'+c.t+' — '+cop(o)+'</option>'});
          return '<article class="jc-card" data-jc="card" data-i="'+i+'" data-pid="p'+slug(p.sabor)+'" data-n="'+esc(p.sabor)+'" data-cat="'+esc(p.categoria)+'" data-s="'+esc(slug(p.sabor+" "+p.descripcion+" "+p.categoria).replace(/-/g," "))+'" data-stock="'+(ag||n===null?"":n)+'" data-p="'+pr+'" data-pc="15"'+(ag?' style="opacity:.6"':'')+'><div class="jc-media"><div class="jc-slider" data-jc="slider"><img class="jc-slide" src="'+esc(foto)+'" alt="'+esc(p.sabor)+'" width="560" height="560" decoding="async" loading="'+(i<2?"eager":"lazy")+'" data-jc="slide"></div><span class="jc-pct" style="display:none;" data-jc="pct"></span>'+(p.etiqueta?'<span class="jc-badge">'+esc(p.etiqueta)+'</span>':'')+'<button class="jc-zoom" data-jc="zoom" type="button" aria-label="Ampliar foto">🔍</button></div><div class="jc-body"><h3 class="jc-name">'+esc(p.sabor)+'</h3><p class="jc-desc">'+esc(p.descripcion)+'</p><div class="jc-prices"><span class="jc-off" data-jc="off">'+cop(pr)+'</span><span class="jc-reg" style="display:none;" data-jc="reg"></span></div><div class="jc-save" style="display:none;" data-jc="save"></div>'+(ag?'<div class="jc-stock">Agotado por hoy 😅</div>':(n!==null&&n<=10?'<div class="jc-stock">🔥 ¡Quedan solo '+n+'!</div>':''))+'<select class="jc-sel" data-jc="var"'+(ag?' disabled':'')+' aria-label="Elegir opción">'+opts+'</select><div class="jc-qrow"><span class="jc-qlab">Cantidad</span><div class="jc-qty" role="group"><button class="jc-qbtn" data-jc="qm" type="button">−</button><input class="jc-qval" data-jc="qv" type="text" inputmode="numeric" maxlength="2" value="1"><button class="jc-qbtn" data-jc="qp" type="button">+</button></div></div><div class="jc-sub" data-jc="sub"></div><button class="jc-buy" data-jc="buy" type="button"'+(ag?' disabled':'')+'>'+(ag?'Agotado':'🛒 Agregar al pedido')+'</button></div></article>';}
        window.__logPedido = function (ref, f, t, items, pay) {
          if (SCRIPT_URL.indexOf("http") !== 0) return;
          var lineas = items.map(function (it) {
              var m = /x(\d+)/i.exec(it.v || "");
              return { sabor: it.n, n: m ? parseInt(m[1], 10) : 1, q: it.q };
          });
          var origen = new URLSearchParams(location.search).get("src") || "";
          var body = JSON.stringify({
              ref: ref, cliente: f.name, tel: f.phone, dir: f.addr, barrio: f.barrio,
              pago: pay, nota: f.note, origen: origen, total_cliente: t.total, lineas: lineas
          });
          try { fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: body }); } catch (e) {}
        };
        function boot(rows){
          var ps=rows.filter(function(r){return r.sabor&&String(r.activo||"SI").toUpperCase()!=="NO"});
          var cats=[];ps.forEach(function(p){if(cats.indexOf(p.categoria)<0)cats.push(p.categoria)});
          var chip=function(c,l){return '<button class="jc-chip" data-jc="chip" type="button" data-cat="'+esc(c)+'" data-on-bg="#16a34a" data-on-fg="#ffffff" data-off-bg="#ffffff" data-off-fg="#0f172a" data-off-bd="rgba(15,23,42,0.22)" aria-pressed="false">'+esc(l)+'</button>'};
          document.querySelector(".jc-chips").innerHTML=chip("","Todos")+cats.map(function(c){return chip(c,c)}).join("");
          document.getElementById(CFG.id+"-cat").innerHTML=ps.map(card).join("");
          run(CFG);}
        fetch(CSV_URL+(CSV_URL.indexOf("?")<0?"?":"&")+"t="+Date.now()).then(function(r){return r.text()}).then(function(txt){
            var rows=[],cur=[""],q=false,row=[];
            for(var i=0;i<txt.length;i++){var ch=txt[i];
              if(q){if(ch=='"'&&txt[i+1]=='"'){cur[cur.length-1]+='"';i++}else if(ch=='"')q=false;else cur[cur.length-1]+=ch}
              else if(ch=='"')q=true;else if(ch==","){cur.push("")}else if(ch=="\n"||ch=="\r"){if(ch=="\r"&&txt[i+1]=="\n")i++;rows.push(cur);cur=[""]}else cur[cur.length-1]+=ch}
            if(cur.length>1||cur[0])rows.push(cur);
            var h=rows.shift().map(function(x){return x.trim().toLowerCase()});
            boot(rows.map(function(r){var o={};h.forEach(function(k,i){o[k]=(r[i]||"").trim()});return o}));
        }).catch(function(){document.getElementById(CFG.id+"-cat").innerHTML='<p style="text-align:center;grid-column:1/-1">No pudimos cargar el catálogo. Escríbenos por WhatsApp 💬</p>'});
      })();

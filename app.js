(function () {
  var $ = function (i) { return document.getElementById(i); };
  var MIN = 5, MAX = 10;

  // CSS da página pública (usado na prévia, no link e no arquivo baixado)
  var PAGE_CSS = '*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:linear-gradient(160deg,#eef2ff 0%,#f8f1ff 50%,#fff4ee 100%);color:#1f2433;display:flex;justify-content:center;padding:48px 18px}.wrap{width:100%;max-width:440px;text-align:center}.av{width:104px;height:104px;border-radius:50%;border:4px solid #fff;box-shadow:0 6px 20px rgba(60,60,120,.15);margin:0 auto 16px}img.av{display:block;object-fit:cover}div.av{display:flex;align-items:center;justify-content:center;background:#dfe3f5;font-size:42px;font-weight:700;color:#5b63a8}h1{font-size:1.4rem;margin:0 0 6px}p{margin:0 0 28px;color:#5d6478;line-height:1.5}.btn{display:block;background:#fff;color:#1f2433;text-decoration:none;font-weight:600;padding:17px 20px;border-radius:14px;margin-bottom:14px;box-shadow:0 2px 10px rgba(60,60,120,.08);border:1px solid rgba(60,60,120,.08);transition:transform .15s,box-shadow .15s}.btn:hover,.btn:focus-visible{transform:translateY(-2px);box-shadow:0 8px 20px rgba(60,60,120,.14)}.btn:active{transform:scale(.98)}';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slugify(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function linkSeguro(u) {
    u = u.trim();
    if (!u) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^(https?:|mailto:|tel:)/i.test(u)) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    return u;
  }
  function fotoSegura(u) { return /^https?:\/\//i.test(u.trim()) ? u.trim() : ''; }
  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_'); }
  function dec(s) { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); }

  // Gera o HTML completo da página pública
  function paginaHTML(d) {
    var av = d.foto
      ? '<img class="av" src="' + esc(d.foto) + '" alt="' + esc(d.nome) + '">'
      : '<div class="av">' + esc(d.nome.charAt(0).toUpperCase()) + '</div>';
    var links = d.links.map(function (l) {
      return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.texto) + '</a>';
    }).join('');
    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(d.nome) + '</title><style>' + PAGE_CSS + '</style></head><body><main class="wrap">' +
      av + '<h1>' + esc(d.nome) + '</h1>' + (d.bio ? '<p>' + esc(d.bio) + '</p>' : '') + links +
      '</main></body></html>';
  }

  // Modo público: o link carrega os dados em #d=...
  if (location.hash.indexOf('#d=') === 0) {
    try {
      var dados = dec(location.hash.slice(3));
      document.open(); document.write(paginaHTML(dados)); document.close();
      return;
    } catch (e) { /* link inválido: cai no painel */ }
  }
  window.addEventListener('hashchange', function () { location.reload(); });

  // Painel
  function addLinha(t, u) {
    if ($('links').children.length >= MAX) return;
    var d = document.createElement('div');
    d.className = 'linha';
    d.innerHTML = '<input class="lt" placeholder="Texto do botão" maxlength="40" autocomplete="off">' +
      '<input class="lu" placeholder="https://..." autocomplete="off">' +
      '<button type="button" class="x" aria-label="Remover link">×</button>';
    d.querySelector('.lt').value = t || '';
    d.querySelector('.lu').value = u || '';
    d.querySelector('.x').onclick = function () { d.remove(); $('add').hidden = false; };
    $('links').appendChild(d);
    $('add').hidden = $('links').children.length >= MAX;
  }

  function coletar() {
    var nome = $('nome').value.trim(), slug = slugify($('slug').value || nome);
    if (!nome) return { erro: 'Informe o nome ou título da página.' };
    if (!slug) return { erro: 'Informe uma URL personalizada.' };
    var foto = $('foto').value.trim();
    if (foto && !fotoSegura(foto)) return { erro: 'O link da foto deve começar com http:// ou https://.' };
    var links = [], rows = $('links').children;
    for (var i = 0; i < rows.length; i++) {
      var t = rows[i].querySelector('.lt').value.trim(), u = rows[i].querySelector('.lu').value;
      if (!t && !u.trim()) continue;
      var url = linkSeguro(u);
      if (!t || !url) return { erro: 'Link ' + (i + 1) + ': preencha o texto e uma URL válida.' };
      links.push({ texto: t, url: url });
    }
    if (!links.length) return { erro: 'Adicione pelo menos um link.' };
    return { nome: nome, bio: $('bio').value.trim(), foto: fotoSegura(foto), slug: slug, links: links };
  }

  function mostrar(d) {
    var link = location.href.split('#')[0] + '#d=' + enc(d);
    $('saida').innerHTML = '<iframe id="prev" title="Prévia"></iframe>' +
      '<label for="lnk" style="margin-top:16px">Seu link</label><input id="lnk" readonly>' +
      '<div class="acoes"><button type="button" class="btn alt" id="cp">Copiar link</button>' +
      '<a class="btn alt" id="ab" target="_blank" rel="noopener">Abrir página</a></div>' +
      '<button type="button" class="btn" id="bx">Baixar ' + esc(d.slug) + '.html</button>' +
      '<p class="hint">Para hospedar com seu próprio endereço, baixe o arquivo e envie para qualquer hospedagem simples (Netlify, GitHub Pages, etc.).</p>';
    $('prev').srcdoc = paginaHTML(d);
    $('lnk').value = link; $('ab').href = link;
    $('lnk').onclick = function () { this.select(); };
    $('cp').onclick = function () {
      var b = this;
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).catch(function () { $('lnk').select(); document.execCommand('copy'); })
        .then(function () { b.textContent = 'Copiado!'; setTimeout(function () { b.textContent = 'Copiar link'; }, 1500); });
    };
    $('bx').onclick = function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([paginaHTML(d)], { type: 'text/html' }));
      a.download = d.slug + '.html'; document.body.appendChild(a); a.click(); a.remove();
    };
  }

  $('add').onclick = function () { addLinha(); };
  $('form').onsubmit = function (e) {
    e.preventDefault();
    var d = coletar();
    $('erro').textContent = d.erro || '';
    if (d.erro) return;
    $('slug').value = d.slug;
    try { localStorage.setItem('linktree:ultimo', JSON.stringify(d)); } catch (x) {}
    mostrar(d);
  };

  // Restaura o último preenchimento
  var salvo = null;
  try { salvo = JSON.parse(localStorage.getItem('linktree:ultimo')); } catch (x) {}
  if (salvo && salvo.links) {
    $('nome').value = salvo.nome; $('bio').value = salvo.bio || ''; $('foto').value = salvo.foto || ''; $('slug').value = salvo.slug;
    salvo.links.forEach(function (l) { addLinha(l.texto, l.url); });
    while ($('links').children.length < MIN) addLinha();
    mostrar(salvo);
  } else {
    for (var i = 0; i < MIN; i++) addLinha();
  }
})();

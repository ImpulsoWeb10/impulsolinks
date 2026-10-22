(function () {
  var $ = function (i) { return document.getElementById(i); };
  var LS = 'linktree:v2', MAX = 10, FOOT = 'Desenvolvido por ImpulsoWeb10';

  var ICONES = [['whatsapp','WhatsApp'],['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok'],['youtube','YouTube'],['cardapio','Cardápio'],['localizacao','Localização'],['telefone','Telefone'],['site','Site'],['pix','Pix'],['avaliacao','Avaliação'],['email','E-mail'],['link','Link']];
  var PH = { whatsapp: 'Número com DDD, ex.: 11999999999', instagram: '@usuario ou link do perfil', telefone: 'Número com DDD', email: 'email@exemplo.com' };
  var TEMAS = [
    { n: 'Lilás',   valor: 'linear-gradient(160deg, #FFE3EC 0%, #E6E1FF 48%, #CFEFFF 100%)', texto: '#1E1B3A', botao: '#FFFFFF', tbotao: '#1E1B3A', borda: 'rgba(255,255,255,.9)', neon: '#8B5CF6' },
    { n: 'Pêssego', valor: 'linear-gradient(160deg, #FFE9D6 0%, #FFD6E0 100%)', texto: '#3B1F2B', botao: '#FFFFFF', tbotao: '#3B1F2B', borda: 'rgba(255,255,255,.9)', neon: '#F97316' },
    { n: 'Menta',   valor: 'linear-gradient(160deg, #D8F5E8 0%, #CFEFFF 100%)', texto: '#12372A', botao: '#FFFFFF', tbotao: '#12372A', borda: 'rgba(255,255,255,.9)', neon: '#10B981' },
    { n: 'Céu',     valor: 'linear-gradient(160deg, #DCEBFF 0%, #E6E1FF 100%)', texto: '#14284B', botao: '#FFFFFF', tbotao: '#14284B', borda: 'rgba(255,255,255,.9)', neon: '#3B82F6' },
    { n: 'Rosa',    valor: 'linear-gradient(160deg, #FFE0EF 0%, #FFD0E5 55%, #F3D9FF 100%)', texto: '#3A1230', botao: '#FFFFFF', tbotao: '#3A1230', borda: 'rgba(255,255,255,.9)', neon: '#EC4899' },
    { n: 'Grafite', valor: 'linear-gradient(160deg, #1F2937 0%, #0B1120 100%)', texto: '#F9FAFB', botao: '#F3F4F6', tbotao: '#111827', borda: 'rgba(255,255,255,.35)', neon: '#A78BFA' }
  ];
  var PADRAO = [
    { icone: 'whatsapp', texto: 'Peça pelo WhatsApp', destaque: true, cor: '#25D366' },
    { icone: 'cardapio', texto: 'Ver cardápio' },
    { icone: 'localizacao', texto: 'Como chegar' },
    { icone: 'instagram', texto: 'Siga no Instagram' },
    { icone: 'avaliacao', texto: 'Avalie no Google' }
  ];

  function slugify(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_'); }
  function dec(s) { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); }
  function lum(h) { var m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return m ? (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) / 255 : 0; }

  // Página final = modelo original + dadosCliente preenchido
  function paginaHTML(d) {
    var json = JSON.stringify(d, null, 2).replace(/</g, '\\u003c');
    return window.MODELO.antes + json + ';\n\n' + window.MODELO.depois;
  }

  // Modo público: o link carrega os dados em #d=...
  if (location.hash.indexOf('#d=') === 0) {
    try {
      var pub = dec(location.hash.slice(3));
      document.title = pub.nome + ' | Links';
      document.body.textContent = '';
      var fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';
      fr.title = pub.nome; fr.srcdoc = paginaHTML(pub);
      document.body.appendChild(fr);
      return;
    } catch (e) { /* link inválido: abre o painel */ }
  }
  window.addEventListener('hashchange', function () { location.reload(); });

  function linkSeguro(u) {
    u = u.trim();
    if (!u) return '';
    var tem = /^[a-z][a-z0-9+.-]*:/i.test(u);
    if (tem && !/^(https?:|mailto:|tel:)/i.test(u)) return '';
    return tem ? u : 'https://' + u;
  }
  function normaliza(ic, v, usuario) {
    v = v.trim();
    if (!v) return ic === 'instagram' && usuario ? 'https://instagram.com/' + usuario : '';
    if (/^[\d\s()+-]+$/.test(v)) {
      var n = v.replace(/\D/g, '');
      if (n.length >= 10 && (ic === 'whatsapp' || ic === 'telefone')) {
        if (n.length <= 11) n = '55' + n;
        return ic === 'whatsapp' ? 'https://wa.me/' + n + '?text=' + encodeURIComponent('Olá! Vim pelo link e gostaria de mais informações.') : 'tel:+' + n;
      }
    }
    if (ic === 'instagram' && (v.charAt(0) === '@' || !/[\/.]/.test(v))) return 'https://instagram.com/' + v.replace(/^@/, '');
    if (ic === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'mailto:' + v;
    return linkSeguro(v);
  }
  function avatar(nome, cor) {
    var ini = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || '?';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="' + cor + '"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="120" font-weight="700" fill="#fff">' + esc(ini) + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ----- Linhas de botões -----
  function addLinha(o) {
    o = o || {};
    if ($('links').children.length >= MAX) return;
    var d = document.createElement('div');
    d.className = 'link';
    d.innerHTML = '<div class="lt1"><select class="ic" aria-label="Ícone">' +
      ICONES.map(function (i) { return '<option value="' + i[0] + '">' + i[1] + '</option>'; }).join('') +
      '</select><input class="lt" maxlength="40" placeholder="Texto do botão" autocomplete="off"></div>' +
      '<input class="lu" autocomplete="off">' +
      '<div class="lt2"><label class="chk"><input type="checkbox" class="ds"> Destaque animado</label>' +
      '<input type="color" class="cr" value="#25D366" aria-label="Cor do destaque"><span class="sp"></span>' +
      '<button type="button" class="mini up" aria-label="Subir">↑</button><button type="button" class="mini dn" aria-label="Descer">↓</button>' +
      '<button type="button" class="mini rm">Remover</button></div>';
    var ic = d.querySelector('.ic'), lu = d.querySelector('.lu'), ds = d.querySelector('.ds'), cr = d.querySelector('.cr');
    ic.value = o.icone || 'link'; d.querySelector('.lt').value = o.texto || ''; lu.value = o.url || '';
    ds.checked = !!o.destaque; if (o.cor) cr.value = o.cor;
    function ph() { lu.placeholder = PH[ic.value] || 'https://...'; cr.hidden = !ds.checked; }
    ic.onchange = ph; ph();
    ds.onchange = function () {
      if (ds.checked) Array.prototype.forEach.call(document.querySelectorAll('.ds'), function (x) { if (x !== ds) { x.checked = false; x.closest('.link').querySelector('.cr').hidden = true; } });
      ph();
    };
    d.querySelector('.up').onclick = function () { if (d.previousElementSibling) d.parentNode.insertBefore(d, d.previousElementSibling); atualizar(); };
    d.querySelector('.dn').onclick = function () { if (d.nextElementSibling) d.parentNode.insertBefore(d.nextElementSibling, d); atualizar(); };
    d.querySelector('.rm').onclick = function () { d.remove(); $('add').hidden = false; atualizar(); };
    $('links').appendChild(d);
    $('add').hidden = $('links').children.length >= MAX;
  }

  // ----- Temas -----
  var temaAtual = 0;
  function pintaTemas() {
    $('temas').innerHTML = '';
    TEMAS.forEach(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sw'; b.title = t.n; b.setAttribute('aria-label', 'Tema ' + t.n);
      b.style.background = t.valor; b.setAttribute('aria-pressed', i === temaAtual);
      b.onclick = function () { temaAtual = i; $('neon').value = t.neon; pintaTemas(); atualizar(); };
      $('temas').appendChild(b);
    });
  }

  // ----- Coleta dos dados -----
  function dados(estrito) {
    var T = TEMAS[temaAtual], neon = $('neon').value;
    var nome = $('nome').value.trim(), usuario = $('usuario').value.trim().replace(/^@/, '').replace(/\s+/g, '');
    if (estrito && !nome) return { erro: 'Informe o nome do negócio ou da pessoa.' };
    if (!nome) nome = 'Seu Nome Aqui';
    var foto = $('foto').value.trim();
    if (foto && !/^https?:\/\//i.test(foto)) return { erro: 'O link da foto deve começar com http:// ou https://.' };
    var links = [], rows = $('links').children;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ic = r.querySelector('.ic').value, t = r.querySelector('.lt').value.trim(), raw = r.querySelector('.lu').value;
      var url = normaliza(ic, raw, usuario);
      if (!t && !raw.trim()) continue;
      if (estrito) {
        if (!t) return { erro: 'Botão ' + (i + 1) + ': escreva o texto do botão.' };
        if (!url) return { erro: 'Botão "' + t + '": informe um link válido ou remova o botão.' };
      }
      var l = { texto: t || 'Botão', url: url || '#', icone: ic, destaque: false };
      if (r.querySelector('.ds').checked) {
        var cor = r.querySelector('.cr').value;
        l.destaque = true; l.cor = cor; l.corTexto = lum(cor) > 0.62 ? '#1E1B3A' : '#FFFFFF';
      }
      links.push(l);
    }
    if (estrito && !links.length) return { erro: 'Adicione pelo menos um botão.' };
    var slug = slugify($('slug').value || nome) || 'meu-link';
    return {
      slug: slug,
      d: {
        nome: nome, usuario: usuario, descricao: $('descricao').value.trim(),
        foto: foto || avatar(nome, neon),
        tema: { tipo: 'gradiente', valor: T.valor, corTexto: T.texto, corBotao: T.botao, corTextoBotao: T.tbotao, corBordaFoto: T.borda, corNeon: neon },
        links: links, rodape: { texto: FOOT, url: '' }
      }
    };
  }

  // ----- Salvar / restaurar -----
  function estado() {
    var ls = [];
    Array.prototype.forEach.call($('links').children, function (r) {
      ls.push({ icone: r.querySelector('.ic').value, texto: r.querySelector('.lt').value, url: r.querySelector('.lu').value, destaque: r.querySelector('.ds').checked, cor: r.querySelector('.cr').value });
    });
    return { nome: $('nome').value, usuario: $('usuario').value, descricao: $('descricao').value, foto: $('foto').value, slug: $('slug').value, tema: temaAtual, neon: $('neon').value, links: ls };
  }
  function aplica(e) {
    $('nome').value = e.nome || ''; $('usuario').value = e.usuario || ''; $('descricao').value = e.descricao || '';
    $('foto').value = e.foto || ''; $('slug').value = e.slug || '';
    temaAtual = e.tema >= 0 && e.tema < TEMAS.length ? e.tema : 0;
    $('neon').value = e.neon || TEMAS[temaAtual].neon;
    $('links').innerHTML = '';
    (e.links && e.links.length ? e.links : PADRAO).forEach(addLinha);
    pintaTemas();
  }

  var tmr, ultimo = '';
  function atualizar() {
    clearTimeout(tmr);
    tmr = setTimeout(function () {
      try { localStorage.setItem(LS, JSON.stringify(estado())); } catch (x) {}
      var r = dados(false);
      if (r.erro) return;
      var html = paginaHTML(r.d);
      if (html !== ultimo) { ultimo = html; $('prev').srcdoc = html; }
    }, 600);
  }

  var slugManual = false;
  $('slug').addEventListener('input', function () { slugManual = true; });
  $('nome').addEventListener('input', function () { if (!slugManual) $('slug').value = slugify($('nome').value); });
  $('form').addEventListener('input', atualizar);
  $('form').addEventListener('change', atualizar);
  $('add').onclick = function () { addLinha({ icone: 'link' }); atualizar(); };
  $('reset').onclick = function () {
    if (!confirm('Apagar tudo e recomeçar?')) return;
    try { localStorage.removeItem(LS); } catch (x) {}
    slugManual = false; aplica({}); $('res').hidden = true; $('erro').textContent = ''; atualizar();
  };

  $('form').onsubmit = function (ev) {
    ev.preventDefault();
    var r = dados(true);
    $('erro').textContent = r.erro || '';
    if (r.erro) return;
    $('slug').value = r.slug;
    var html = paginaHTML(r.d); ultimo = html; $('prev').srcdoc = html;
    try { localStorage.setItem(LS, JSON.stringify(estado())); } catch (x) {}
    var link = location.href.split('#')[0] + '#d=' + enc(r.d);
    $('lnk').value = link; $('ab').href = link; $('res').hidden = false;
    $('dica').textContent = 'Para ter o endereço seusite.com/' + r.slug + ', baixe o HTML, renomeie para index.html e envie dentro de uma pasta chamada "' + r.slug + '" na sua hospedagem.';
    $('cp').onclick = function () {
      var b = this;
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).catch(function () { $('lnk').select(); document.execCommand('copy'); })
        .then(function () { b.textContent = 'Copiado!'; setTimeout(function () { b.textContent = 'Copiar'; }, 1500); });
    };
    $('bx').onclick = function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = r.slug + '.html'; document.body.appendChild(a); a.click(); a.remove();
    };
    $('res').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Início
  var salvo = null;
  try { salvo = JSON.parse(localStorage.getItem(LS)); } catch (x) {}
  aplica(salvo || {});
  slugManual = !!(salvo && salvo.slug);
  var r0 = dados(false); if (!r0.erro) { ultimo = paginaHTML(r0.d); $('prev').srcdoc = ultimo; }
})();

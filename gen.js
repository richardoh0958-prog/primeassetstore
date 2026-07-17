/* ============================================================
   프라임에셋 게시판 - 정적 페이지 생성 엔진 (gen.js)
   브라우저(write.html)와 Node(빌드) 양쪽에서 동일하게 사용.
   ============================================================ */
(function (root) {

  const SITE = {
    name: '프라임에셋',
    brand: '프라임에셋 보험정보',
    base: 'https://primeasset-bohum.store',   // 커스텀 도메인
    logo: 'images/img_1.webp',
    tel: '010-6243-0958',
    kakao: 'https://pf.kakao.com/_xfexmsX/chat',
    agencyLine: '(주)프라임에셋 보험대리점 (협회 등록번호 : 2009058101) - 설계사 오진호 (손,생보협회 등록번호 : 20070283070009)'
  };

  // ---------- utils ----------
  function esc(s){ return String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function stripTags(html){ return String(html||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
  function trunc(s,n){ s=String(s||''); return s.length>n ? s.slice(0,n).trim()+'…' : s; }
  function fmtDate(d){ return d ? String(d).replace(/-/g,'.') : '-'; }
  function firstImg(html){ const m = String(html||'').match(/<img[^>]+src=["']([^"']+)["']/i); return m ? m[1] : ''; }
  function slugify(s){
    return String(s||'').trim().toLowerCase()
      .replace(/[^\w가-힣\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,60);
  }
  function fileName(post){
    if(post.slug && post.slug.trim()) return 'post-' + slugify(post.slug) + '.html';
    return 'post-' + post.id + '.html';
  }
  function absUrl(path){ return SITE.base.replace(/\/$/,'') + '/' + String(path).replace(/^\//,''); }

  // ---------- shared CSS ----------
  function styles(){ return `<style>
:root{--blue:#2563eb;--blue3:#93c5fd;--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--line2:#eef2f7;--soft:#f8fafc;--max:1100px;}
*{box-sizing:border-box;}html{scroll-behavior:smooth;}
body{margin:0;font-family:'Pretendard','Noto Sans KR',sans-serif;background:#fff;color:var(--ink);-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
.nav{position:sticky;top:0;z-index:600;background:#fff;border-bottom:1px solid var(--line);}
.nav-inner{max-width:var(--max);margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;}
.nav-logo img{height:42px;width:auto;object-fit:contain;display:block;}
.nav-logo .txt{font-family:'Noto Serif KR',serif;font-weight:900;font-size:19px;color:var(--ink);}
.nav-right{display:flex;align-items:center;gap:10px;}
.nav-home{font-size:13px;font-weight:700;color:var(--muted);padding:8px 14px;border-radius:30px;}
.nav-home:hover{background:var(--soft);color:var(--ink);}
.nav-tel{display:flex;align-items:center;gap:6px;background:rgba(37,99,235,.10);border:1px solid rgba(37,99,235,.25);color:var(--blue);font-size:13px;font-weight:700;padding:8px 16px;border-radius:30px;}
.nav-kakao{display:flex;align-items:center;gap:6px;background:#FEE500;color:#3A1D1D;font-size:13px;font-weight:800;padding:8px 16px;border-radius:30px;}
.nav-kakao:hover{background:#F5D800;}
.banner{background:linear-gradient(135deg,#1e2d4a 0%,#243654 45%,#1a3060 100%);color:#fff;padding:52px 24px 46px;text-align:center;border-bottom:1px solid rgba(99,149,255,.15);}
.banner h1{font-family:'Noto Serif KR',serif;font-weight:900;font-size:32px;margin:0 0 12px;letter-spacing:-.5px;}
.banner p{color:rgba(255,255,255,.78);font-size:15px;margin:0;line-height:1.6;word-break:keep-all;}
.banner .chip{display:inline-block;background:rgba(147,197,253,.16);border:1px solid rgba(147,197,253,.3);color:#bfdbfe;font-size:12px;font-weight:700;padding:6px 14px;border-radius:30px;margin-bottom:16px;}
.wrap{max-width:var(--max);margin:0 auto;padding:36px 24px 40px;}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;}
.tabs{display:flex;gap:8px;flex-wrap:wrap;}
.tab{font-size:13px;font-weight:700;color:var(--muted);background:#fff;border:1px solid var(--line);padding:8px 16px;border-radius:30px;cursor:pointer;transition:all .18s;}
.tab:hover{border-color:var(--blue3);color:var(--blue);}
.tab.on{background:var(--blue);border-color:var(--blue);color:#fff;}
.search{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:30px;padding:8px 16px;min-width:220px;}
.search input{border:none;outline:none;font-size:14px;font-family:inherit;width:100%;background:transparent;}
.search svg{flex:0 0 auto;color:var(--muted);}
.count{font-size:13px;color:var(--muted);margin-bottom:10px;}.count b{color:var(--blue);}
table.board{width:100%;border-collapse:collapse;border-top:2px solid var(--ink);}
table.board thead th{font-size:13px;font-weight:800;color:var(--ink);background:var(--soft);padding:14px 10px;border-bottom:1px solid var(--line);text-align:center;}
table.board tbody td{font-size:14px;padding:0;border-bottom:1px solid var(--line2);text-align:center;color:var(--muted);vertical-align:middle;}
table.board tbody tr:hover{background:#f6f9ff;}
table.board td a,table.board td .cell{display:block;padding:16px 10px;color:inherit;}
.col-no{width:64px;font-size:13px;}.col-cat{width:120px;}.col-title{text-align:left;}
.col-simui{width:150px;font-size:12px;color:#94a3b8;}.col-date{width:110px;font-size:13px;}
.t-title{color:var(--ink);font-weight:600;text-align:left;word-break:keep-all;line-height:1.5;}
.t-title .new{display:inline-block;margin-left:6px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;padding:1px 6px;border-radius:4px;vertical-align:middle;}
.cat-badge{display:inline-block;font-size:12px;font-weight:700;color:var(--blue);background:rgba(37,99,235,.08);padding:4px 11px;border-radius:20px;}
.empty{text-align:center;padding:70px 20px;color:var(--muted);font-size:15px;}
.pager{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:28px;}
.pager button{min-width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:9px;font-size:14px;font-weight:600;color:var(--muted);cursor:pointer;font-family:inherit;}
.pager button:hover:not(:disabled){border-color:var(--blue3);color:var(--blue);}
.pager button.on{background:var(--blue);border-color:var(--blue);color:#fff;}
.pager button:disabled{opacity:.4;cursor:default;}
.crumb{font-size:13px;color:var(--muted);margin-bottom:18px;}
.crumb a{color:var(--blue);}
.art-head{border-bottom:1px solid var(--line);padding-bottom:22px;margin-bottom:26px;}
.art-head .cat-badge{margin-bottom:14px;}
.art-title{font-family:'Noto Serif KR',serif;font-weight:900;font-size:28px;line-height:1.4;color:var(--ink);margin:0 0 16px;word-break:keep-all;}
.art-meta{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--muted);}
.art-meta .simui{color:var(--blue);font-weight:700;}
.art-body{font-size:16px;line-height:1.9;color:#374151;word-break:keep-all;}
.art-body p{margin:0 0 18px;}
.art-body h2,.art-body h3{font-family:'Noto Serif KR',serif;color:var(--ink);margin:30px 0 14px;line-height:1.5;}
.art-body h2{font-size:21px;}.art-body h3{font-size:18px;}
.art-body img{max-width:100%;height:auto;border-radius:12px;margin:14px 0;display:block;}
.art-body ul,.art-body ol{padding-left:22px;margin:0 0 18px;}.art-body li{margin-bottom:8px;}
.art-body a{color:var(--blue);text-decoration:underline;}.art-body strong{color:var(--ink);}
.art-body blockquote{border-left:3px solid var(--blue3);background:var(--soft);margin:0 0 18px;padding:14px 18px;border-radius:0 8px 8px 0;color:#475569;}
.simui-box{margin-top:36px;padding:16px 18px;background:var(--soft);border:1px solid var(--line);border-radius:12px;font-size:13px;color:var(--muted);line-height:1.7;}
.simui-box b{color:var(--blue);}
.art-nav{display:flex;justify-content:space-between;gap:12px;margin-top:30px;padding-top:22px;border-top:1px solid var(--line);}
.art-nav a{flex:1;background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px;font-size:13px;font-weight:700;color:var(--muted);}
.art-nav a:hover{border-color:var(--blue3);color:var(--blue);}
.art-nav .lbl{font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;}
.art-nav .disabled{opacity:.35;pointer-events:none;}
.tolist{display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:700;color:var(--muted);margin-bottom:22px;}
.tolist:hover{color:var(--blue);}
footer{background:#fff;border-top:1px solid var(--line);padding:36px 24px 48px;margin-top:56px;}
.f-inner{max-width:var(--max);margin:0 auto;text-align:center;}
.f-logo img{height:56px;width:auto;object-fit:contain;display:block;margin:0 auto 12px;}
.f-comp{margin-top:16px;padding-top:16px;border-top:1px solid var(--line);font-size:11px;color:#64748b;line-height:1.85;word-break:keep-all;text-align:left;}
.f-comp p{margin:0 0 6px;}.f-comp strong{color:#334155;}
.f-note{margin-top:16px;padding:16px;background:rgba(37,99,235,.05);border:1px solid rgba(37,99,235,.15);border-radius:12px;text-align:left;}
.f-note p{font-size:11px;color:#64748b;line-height:1.85;word-break:keep-all;margin:0 0 6px;}.f-note p:last-child{margin-bottom:0;}
@media(max-width:720px){.banner h1{font-size:25px;}.nav-tel{display:none;}.col-simui{display:none;}.col-no{width:44px;}.col-cat{width:78px;}.cat-badge{font-size:11px;padding:3px 8px;}.art-title{font-size:23px;}.art-body{font-size:15px;}.wrap{padding:26px 16px 34px;}}
</style>`; }

  function headLinks(){ return `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@600;700;900&display=swap" rel="stylesheet"/>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"/>`; }

  function navHtml(){ return `<nav class="nav"><div class="nav-inner">
<a class="nav-logo" href="index.html"><img src="${SITE.logo}" alt="${esc(SITE.name)}" onerror="this.outerHTML='<span class=&quot;txt&quot;>${esc(SITE.name)}</span>'"></a>
<div class="nav-right">
<a class="nav-home" href="index.html">홈</a>
<a class="nav-tel" href="tel:${SITE.tel}">📞 상담전화</a>
<a class="nav-kakao" href="${SITE.kakao}" target="_blank" rel="noopener">💬 카카오 상담</a>
</div></div></nav>`; }

  function footerHtml(){ return `<footer><div class="f-inner">
<div class="f-logo"><img src="${SITE.logo}" alt="${esc(SITE.name)}" onerror="this.style.display='none'"></div>
<div class="f-note">
<p>※ 본 내용은 모집 종사자 개인의 의견이며, 계약 체결에 따른 이익 또는 손실은 보험계약자 등에게 귀속됩니다.</p>
<p>※ 보험회사 상품별, 성별, 연령, 직업 등에 따라 가입가능한 담보와 가입금액, 보험료 등은 달라질 수 있습니다.</p>
<p>※ 보험사 및 상품별로 상이할 수 있으므로, 관련한 세부사항은 반드시 해당 약관을 참조하시기 바랍니다.</p>
</div>
<div class="f-comp">
<p><strong>보험대리점 명칭 및 등록번호</strong> - ${esc(SITE.agencyLine)}</p>
<p><strong>상품설명서 및 약관 참조</strong> - 계약체결 전 상품설명서 및 약관을 자세히 읽어보시기 바랍니다.</p>
<p><strong>모집종사자의 대리·중개 및 보험계약체결권 부여 여부</strong> - 오진호는 다수의 보험사와 계약체결 및 대리·중개하는 보험설계사이고, 보험회사로부터 보험계약 체결권을 부여받지 아니하였습니다.</p>
<p><strong>법령 및 내부통제기준에 따른 광고 관련 절차 준수사항</strong> - 본 광고는 광고심의기준을 준수하였으며, 유효기간은 심의일로부터 1년입니다.</p>
<p style="margin-top:10px;"><a href="privacy_1.html" target="_blank" rel="noopener" style="color:var(--blue);font-size:12px;">📄 개인정보처리방침</a></p>
</div></div></footer>`; }

  function sortPosts(posts){
    return posts.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.id||0)-(a.id||0));
  }

  // ---------- 글 상세 페이지 ----------
  function postPage(post, allPosts){
    const sorted = sortPosts(allPosts);
    const idx = sorted.findIndex(p => p.id === post.id);
    const older = sorted[idx+1], newer = sorted[idx-1];
    const desc = trunc(stripTags(post.body), 120);
    const url = absUrl(fileName(post));
    const og = firstImg(post.body);
    const ogImg = og ? ( og.startsWith('http')?og:absUrl(og)) : absUrl(SITE.logo);

    const jsonld = {
      "@context":"https://schema.org","@type":"Article",
      "headline": post.title,
      "datePublished": post.date, "dateModified": post.date,
      "author": {"@type":"Person","name":"오진호"},
      "publisher": {"@type":"Organization","name":SITE.name,"logo":{"@type":"ImageObject","url":absUrl(SITE.logo)}},
      "mainEntityOfPage": {"@type":"WebPage","@id":url},
      "description": desc,
      "image": ogImg,
      "articleSection": post.category || undefined
    };

    const relLink = (p, dir) => p
      ? `<a href="${fileName(p)}"${dir==='next'?' style="text-align:right;"':''}><span class="lbl">${dir==='prev'?'이전 글':'다음 글'}</span>${esc(trunc(p.title,26))}</a>`
      : `<a class="disabled"><span class="lbl">${dir==='prev'?'이전 글':'다음 글'}</span>${dir==='prev'?'이전 글 없음':'다음 글 없음'}</a>`;

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(post.title)} | ${esc(SITE.brand)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${esc(post.title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${esc(ogImg)}"/>
<meta property="og:site_name" content="${esc(SITE.name)}"/>
<meta name="twitter:card" content="summary_large_image"/>
${headLinks()}
${styles()}
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${navHtml()}
<div class="wrap">
<nav class="crumb"><a href="index.html">홈</a> › <a href="board.html">보험 정보 게시판</a> › ${esc(post.category||'글')}</nav>
<a class="tolist" href="board.html"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>목록으로</a>
<article>
<div class="art-head">
${post.category?`<span class="cat-badge">${esc(post.category)}</span>`:''}
<h1 class="art-title">${esc(post.title)}</h1>
<div class="art-meta"><span>등록일 ${fmtDate(post.date)}</span>${post.simui?`<span class="simui">심의필 ${esc(post.simui)}</span>`:''}</div>
</div>
<div class="art-body">${post.body||''}</div>
${post.simui?`<div class="simui-box">본 게시물은 광고심의를 완료한 콘텐츠입니다. &nbsp;<b>심의필 ${esc(post.simui)}</b>${post.simuiPeriod?(' &nbsp;('+esc(post.simuiPeriod)+')'):''}</div>`:''}
</article>
<nav class="art-nav">${relLink(older,'prev')}${relLink(newer,'next')}</nav>
</div>
${footerHtml()}
</body>
</html>`;
  }

  // ---------- 목록 페이지 ----------
  function boardPage(allPosts){
    const sorted = sortPosts(allPosts);
    const total = sorted.length;
    const cats = Array.from(new Set(sorted.map(p=>p.category).filter(Boolean)));
    const now = Date.now();

    const tabs = ['전체', ...cats].map((c,i)=>`<button class="tab ${i===0?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

    const rows = sorted.map((p,i)=>{
      const no = total - i;
      const isNew = p.date && (now - new Date(p.date).getTime()) < 7*864e5;
      const href = fileName(p);
      return `<tr data-cat="${esc(p.category||'')}" data-title="${esc((p.title||'').toLowerCase())}">
<td class="col-no"><a href="${href}">${no}</a></td>
<td class="col-cat"><a href="${href}">${p.category?`<span class="cat-badge">${esc(p.category)}</span>`:''}</a></td>
<td class="col-title"><a href="${href}"><span class="t-title">${esc(p.title)}${isNew?'<span class="new">NEW</span>':''}</span></a></td>
<td class="col-simui"><a href="${href}">${esc(p.simui||'-')}</a></td>
<td class="col-date"><a href="${href}">${fmtDate(p.date)}</a></td>
</tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>보험 정보 게시판 | ${esc(SITE.name)}</title>
<meta name="description" content="심의를 완료한 보험 정보 칼럼과 자료를 모은 게시판입니다."/>
<link rel="canonical" href="${absUrl('board.html')}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="보험 정보 게시판 | ${esc(SITE.name)}"/>
<meta property="og:description" content="심의를 완료한 보험 정보 칼럼과 자료를 모은 게시판입니다."/>
<meta property="og:url" content="${absUrl('board.html')}"/>
${headLinks()}
${styles()}
</head>
<body>
${navHtml()}
<div class="banner">
<span class="chip">심의필 정보 게시판</span>
<h1>보험 정보 게시판</h1>
<p>정확한 정보 전달을 위해 <b>광고심의를 완료한</b> 보험 칼럼과 자료만 게시합니다.</p>
</div>
<div class="wrap">
<div class="toolbar">
<div class="tabs" id="tabs">${tabs}</div>
<div class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input id="q" type="text" placeholder="제목 검색"/></div>
</div>
<div class="count" id="count">총 <b>${total}</b>건</div>
<table class="board">
<thead><tr><th class="col-no">번호</th><th class="col-cat">분류</th><th class="col-title" style="text-align:left;padding-left:14px;">제목</th><th class="col-simui">심의필</th><th class="col-date">등록일</th></tr></thead>
<tbody id="rows">${rows || `<tr><td colspan="5"><div class="empty">등록된 게시글이 없습니다.</div></td></tr>`}</tbody>
</table>
<div class="pager" id="pager"></div>
</div>
${footerHtml()}
<script>
(function(){
  var PAGE=10, cat='전체', q='', page=1;
  var rows=[].slice.call(document.querySelectorAll('#rows tr[data-cat]'));
  var tabs=document.getElementById('tabs'), qi=document.getElementById('q');
  function filtered(){return rows.filter(function(r){var okC=cat==='전체'||r.dataset.cat===cat;var okQ=!q||r.dataset.title.indexOf(q)>-1;return okC&&okQ;});}
  function render(){
    var f=filtered(), pages=Math.max(1,Math.ceil(f.length/PAGE));
    if(page>pages)page=pages;
    rows.forEach(function(r){r.style.display='none';});
    f.slice((page-1)*PAGE,page*PAGE).forEach(function(r){r.style.display='';});
    document.getElementById('count').innerHTML='총 <b>'+f.length+'</b>건';
    var pg='';
    if(pages>1){
      pg+='<button '+(page===1?'disabled':'')+' data-go="'+(page-1)+'">‹</button>';
      for(var i=1;i<=pages;i++)pg+='<button class="'+(i===page?'on':'')+'" data-go="'+i+'">'+i+'</button>';
      pg+='<button '+(page===pages?'disabled':'')+' data-go="'+(page+1)+'">›</button>';
    }
    var pe=document.getElementById('pager');pe.innerHTML=pg;
    [].slice.call(pe.querySelectorAll('button')).forEach(function(b){b.onclick=function(){page=+b.dataset.go;render();window.scrollTo({top:0,behavior:'smooth'});};});
  }
  [].slice.call(tabs.querySelectorAll('.tab')).forEach(function(t){t.onclick=function(){cat=t.dataset.cat;page=1;[].slice.call(tabs.querySelectorAll('.tab')).forEach(function(x){x.classList.remove('on');});t.classList.add('on');render();};});
  qi.addEventListener('input',function(){q=qi.value.trim().toLowerCase();page=1;render();});
  render();
})();
</script>
</body>
</html>`;
  }

  // ---------- sitemap / robots ----------
  function sitemapXml(allPosts){
    const urls = [absUrl('index.html'), absUrl('board.html'), ...sortPosts(allPosts).map(p=>absUrl(fileName(p)))];
    const items = urls.map(u=>`  <url><loc>${esc(u)}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
  }
  function robotsTxt(){
    return `User-agent: *\nAllow: /\n\nSitemap: ${absUrl('sitemap.xml')}\n`;
  }

  const GEN = { SITE, esc, stripTags, trunc, fmtDate, slugify, fileName, sortPosts, postPage, boardPage, sitemapXml, robotsTxt,
    absUrl, styles, headLinks, navHtml, footerHtml };
  if (typeof module !== 'undefined' && module.exports) module.exports = GEN;
  else root.GEN = GEN;

})(typeof window !== 'undefined' ? window : this);

(function () {
  'use strict';

  var MC_PROXY = '/api/minecraft';

  /* ── State ────────────────────────────────────────────── */
  var authCode   = '';
  var servers    = [];
  var selServer  = null;
  var srvType    = 'Vanilla';
  var showCreate = false;

  /* ── DOM refs ─────────────────────────────────────────── */
  var authView     = document.getElementById('mca-auth');
  var dashView     = document.getElementById('mca-dash');
  var codeInput    = document.getElementById('mca-code');
  var authBtn      = document.getElementById('mca-auth-btn');
  var authError    = document.getElementById('mca-error');
  var codeBadge    = document.getElementById('mca-badge');
  var logoutBtn    = document.getElementById('mca-logout');
  var srvGrid      = document.getElementById('mca-srv-grid');
  var toggleCreate = document.getElementById('mca-toggle-create');
  var createPanel  = document.getElementById('mca-create');
  var createBtn    = document.getElementById('mca-create-btn');
  var createError  = document.getElementById('mca-create-error');
  var typeRow      = document.getElementById('mca-type-row');
  var verSel       = document.getElementById('mca-ver');
  var consoleWrap  = document.getElementById('mca-console');
  var consoleOut   = document.getElementById('mca-con-out');
  var consoleTitle = document.getElementById('mca-con-title');
  var consoleClose = document.getElementById('mca-con-close');
  var consoleForm  = document.getElementById('mca-con-form');
  var consoleInp   = document.getElementById('mca-con-inp');

  /* ── Auth ─────────────────────────────────────────────── */
  authBtn.addEventListener('click', doAuth);
  codeInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doAuth();
  });

  async function doAuth() {
    var code = codeInput.value.trim();
    if (!code) return;
    authBtn.disabled = true;
    authBtn.textContent = '확인 중...';
    authError.style.display = 'none';
    try {
      var res  = await fetch('/api/minecraft/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code }),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) { showErr(data.error || '유효하지 않은 코드입니다.'); return; }
      authCode = code;
      enterDash();
    } catch (_) {
      showErr('네트워크 오류가 발생했습니다.');
    } finally {
      authBtn.disabled = false;
      authBtn.textContent = '접속';
    }
  }

  function showErr(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }

  /* ── Dashboard ────────────────────────────────────────── */
  function enterDash() {
    authView.style.display = 'none';
    dashView.style.display = 'block';
    codeBadge.textContent = authCode.length > 12
      ? authCode.slice(0, 8) + '...' : authCode;
    loadServers();
    loadVersions(srvType);
  }

  logoutBtn.addEventListener('click', function () {
    authCode  = '';
    servers   = [];
    selServer = null;
    hideConsole();
    hideCreatePanel();
    dashView.style.display = 'none';
    authView.style.display = 'flex';
    codeInput.value = '';
  });

  /* ── Server List (API) ────────────────────────────────── */
  async function loadServers() {
    srvGrid.innerHTML =
      '<p class="mc-muted" style="text-align:center;padding:40px 0">불러오는 중...</p>';
    try {
      var res  = await fetch(MC_PROXY + '/servers?auth=' + encodeURIComponent(authCode));
      var data = await res.json().catch(function () { return {}; });
      servers  = Array.isArray(data.servers) ? data.servers
               : Array.isArray(data)         ? data
               : [];
      renderGrid();
    } catch (_) {
      srvGrid.innerHTML =
        '<p class="mc-muted" style="text-align:center;padding:40px 0">서버 목록을 불러올 수 없습니다.</p>';
    }
  }

  function renderGrid() {
    if (servers.length === 0) {
      srvGrid.innerHTML =
        '<div class="mc-empty">' +
          '<p class="mc-muted" style="margin-bottom:6px">등록된 서버가 없습니다.</p>' +
          '<p class="mc-muted" style="font-size:11px">위의 버튼을 눌러 새 서버를 만드세요.</p>' +
        '</div>';
      return;
    }
    var grid = document.createElement('div');
    grid.className = 'srv-grid';
    servers.forEach(function (s) { grid.appendChild(buildCard(s)); });
    srvGrid.innerHTML = '';
    srvGrid.appendChild(grid);
  }

  function buildCard(s) {
    var card    = document.createElement('div');
    card.className = 'srv-card';
    var typeLow = (s.type || 'vanilla').toLowerCase();
    var online  = s.status === 'online' || s.status === 'running';
    card.innerHTML =
      '<div class="srv-meta">' +
        '<span class="status-dot ' + (online ? 'on' : 'off') + '"></span>' +
        '<span class="srv-ver">' + esc(s.version) + '</span>' +
        '<span class="type-badge ' + typeLow + '">' + esc(s.type) + '</span>' +
      '</div>' +
      '<span class="srv-name">' + esc(s.name || s.server_name) + '</span>' +
      '<span class="mc-muted" style="font-size:11px;font-family:monospace">' +
        (s.uid || s.id || '').slice(0, 8) + '...' +
      '</span>' +
      '<div class="card-actions">' +
        '<button class="btn-sm btn-tog">' + (online ? '끄기' : '켜기') + '</button>' +
        '<button class="btn-sm btn-con">콘솔</button>' +
        '<button class="btn-sm del btn-del">삭제</button>' +
      '</div>';

    card.querySelector('.btn-tog').addEventListener('click', function () {
      // TODO: on/off API 연결
      alert('서버 관리 API 연동 예정');
    });
    card.querySelector('.btn-con').addEventListener('click', function () {
      openConsole(s);
    });
    card.querySelector('.btn-del').addEventListener('click', function () {
      // TODO: 삭제 API 연결
      alert('서버 삭제 API 연동 예정');
    });
    return card;
  }

  /* ── Version List ─────────────────────────────────────── */
  async function loadVersions(type) {
    verSel.disabled = true;
    verSel.innerHTML = '<option value="">불러오는 중...</option>';
    try {
      var res  = await fetch(MC_PROXY + '/versions?server_type=' + encodeURIComponent(type));
      var data = await res.json();
      if (!data.status || !Array.isArray(data.releases)) throw new Error();
      verSel.innerHTML = '';
      data.releases.forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        verSel.appendChild(opt);
      });
    } catch (_) {
      verSel.innerHTML = '<option value="">버전 로드 실패</option>';
    } finally {
      verSel.disabled = false;
    }
  }

  /* ── Create Form ──────────────────────────────────────── */
  toggleCreate.addEventListener('click', function () {
    showCreate = !showCreate;
    createPanel.style.display = showCreate ? 'block' : 'none';
    toggleCreate.textContent = showCreate ? '닫기' : '+ 새 서버';
  });

  function hideCreatePanel() {
    showCreate = false;
    createPanel.style.display = 'none';
    toggleCreate.textContent = '+ 새 서버';
  }

  typeRow.addEventListener('click', function (e) {
    var btn = e.target.closest('.type-btn');
    if (!btn) return;
    typeRow.querySelectorAll('.type-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    srvType = btn.dataset.t;
    loadVersions(srvType);
  });

  createBtn.addEventListener('click', async function () {
    var name = document.getElementById('mca-name').value.trim();
    var ver  = verSel.value;
    createError.style.display = 'none';

    if (!name) { showCreateErr('서버 이름을 입력하세요.'); return; }
    if (!ver)  { showCreateErr('버전을 선택하세요.'); return; }

    createBtn.disabled = true;
    createBtn.textContent = '생성 중...';
    try {
      await createSrv(name, srvType, ver);
      document.getElementById('mca-name').value = '';
      hideCreatePanel();
      await loadServers();
    } catch (e) {
      showCreateErr(e.message || '서버 생성에 실패했습니다.');
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = '서버 생성';
    }
  });

  async function createSrv(name, type, version) {
    var url = MC_PROXY + '/create' +
      '?server_type=' + encodeURIComponent(type) +
      '&version='     + encodeURIComponent(version) +
      '&server_name=' + encodeURIComponent(name) +
      '&auth='        + encodeURIComponent(authCode);

    var res  = await fetch(url);
    var data = await res.json().catch(function () { return {}; });

    if (!res.ok || !data.status) {
      throw new Error(data.message || ('서버 생성 실패 (' + res.status + ')'));
    }
    return data.uid;
  }

  function showCreateErr(msg) {
    createError.textContent = msg;
    createError.style.display = 'block';
  }

  /* ── Console ──────────────────────────────────────────── */
  function openConsole(server) {
    selServer = server;
    var uid   = server.uid || server.id || '';
    consoleTitle.textContent = '콘솔 — ' + (server.name || server.server_name) + '  (' + uid.slice(0, 8) + '...)';
    consoleWrap.style.display      = 'flex';
    consoleWrap.style.flexDirection = 'column';
    consoleOut.innerHTML = '';
    appendLog('[콘솔] 서버 UID: ' + uid, false);
    appendLog('[콘솔] 콘솔 API 연동 예정', false);
    consoleInp.focus();
  }

  function hideConsole() {
    consoleWrap.style.display = 'none';
    selServer = null;
  }

  consoleClose.addEventListener('click', hideConsole);

  consoleForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var cmd = consoleInp.value.trim();
    if (!cmd) return;
    appendLog('> ' + cmd, true);
    // TODO: 명령어 전송 API 연결
    appendLog('[Server] 명령어 전송됨 (API 연동 예정)', false);
    consoleInp.value = '';
  });

  function appendLog(text, isCmd) {
    var span = document.createElement('span');
    span.className = 'log-line' + (isCmd ? ' cmd' : '');
    span.textContent = text;
    consoleOut.appendChild(span);
    consoleOut.scrollTop = consoleOut.scrollHeight;
  }

  /* ── Util ─────────────────────────────────────────────── */
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();

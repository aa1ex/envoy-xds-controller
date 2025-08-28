(function(){
  const apiBase = '/api/v1';
  const $ = (id) => document.getElementById(id);

  function getToken(){
    return localStorage.getItem('authToken') || '';
  }
  function setToken(t){
    if (t) localStorage.setItem('authToken', t); else localStorage.removeItem('authToken');
    updateTokenStatus();
  }
  function updateTokenStatus(){
    const t = getToken();
    $('tokenStatus').textContent = t ? 'token set' : 'no token';
    $('authToken').value = t || '';
  }
  function headers(json=true){
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    const t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }
  async function api(path, opts={}){
    const url = apiBase + path;
    const res = await fetch(url, Object.assign({ headers: headers(opts.body !== undefined) }, opts));
    const txt = await res.text();
    let data;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
    if (!res.ok) throw { status: res.status, data };
    return data;
  }
  function out(el, data){
    el.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }
  function errToStr(e){
    if (!e) return 'unknown error';
    if (typeof e === 'string') return e;
    if (e.data) return typeof e.data === 'string' ? e.data : JSON.stringify(e.data, null, 2);
    return e.message || JSON.stringify(e);
  }

  // Save token
  $('saveToken').addEventListener('click', () => setToken($('authToken').value.trim()));
  updateTokenStatus();

  // Planes
  $('btnListPlanes').addEventListener('click', async () => {
    try { const data = await api('/planes'); out($('planesOut'), data); }
    catch(e){ out($('planesOut'), 'Error: ' + errToStr(e)); }
  });

  $('btnPutPlane').addEventListener('click', async () => {
    const id = $('planeId').value.trim();
    const body = {
      address: $('planeAddress').value.trim(),
      port: Number($('planePort').value),
      enabled: $('planeEnabled').checked,
      region: $('planeRegion').value.trim(),
      weight: Number($('planeWeight').value || 0)
    };
    if (!id) { alert('Plane ID (plane_id) is required'); return; }
    try { await api('/planes/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(body) }); alert('OK'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnGetPlane').addEventListener('click', async () => {
    const id = $('getPlaneId').value.trim(); if (!id) return;
    try { const data = await api('/planes/' + encodeURIComponent(id)); out($('getPlaneOut'), data); }
    catch(e){ out($('getPlaneOut'), 'Error: ' + errToStr(e)); }
  });

  $('btnDelPlane').addEventListener('click', async () => {
    const id = $('delPlaneId').value.trim(); if (!id) return;
    try { await api('/planes/' + encodeURIComponent(id), { method: 'DELETE' }); alert('Deleted'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnSetDefault').addEventListener('click', async () => {
    const id = $('defaultPlane').value.trim(); if (!id) return;
    try { await api('/defaults/route', { method: 'PUT', body: JSON.stringify({ target: id }) }); alert('Default route set'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  // Client
  $('btnGetClient').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); if (!k) return;
    try { const data = await api('/clients/' + encodeURIComponent(k)); out($('clientOut'), data); }
    catch(e){ out($('clientOut'), 'Error: ' + errToStr(e)); }
  });

  $('btnPutClient').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); const t = $('clientTarget').value.trim(); if (!k || !t) return;
    try { await api('/clients/' + encodeURIComponent(k), { method: 'PUT', body: JSON.stringify({ target: t }) }); alert('OK'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnDelClient').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); if (!k) return;
    try { await api('/clients/' + encodeURIComponent(k), { method: 'DELETE' }); alert('Deleted'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnResolve').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); if (!k) return;
    try { const data = await api('/resolve/' + encodeURIComponent(k)); out($('resolveOut'), data); }
    catch(e){ out($('resolveOut'), 'Error: ' + errToStr(e)); }
  });

  // Client routes list
  $('btnListClientRoutes').addEventListener('click', async () => {
    try { const data = await api('/clients'); out($('clientsOut'), data); }
    catch(e){ out($('clientsOut'), 'Error: ' + errToStr(e)); }
  });

  // Cohorts
  $('btnListCohorts').addEventListener('click', async () => {
    try { const data = await api('/cohorts'); out($('cohortsOut'), data); }
    catch(e){ out($('cohortsOut'), 'Error: ' + errToStr(e)); }
  });

  $('btnPutCohort').addEventListener('click', async () => {
    const name = $('cohortName').value.trim(); const target = $('cohortTarget').value.trim(); if (!name || !target) return;
    try { await api('/cohorts/' + encodeURIComponent(name), { method: 'PUT', body: JSON.stringify({ target }) }); alert('OK'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnDelCohort').addEventListener('click', async () => {
    const name = $('cohortName').value.trim(); if (!name) return;
    try { await api('/cohorts/' + encodeURIComponent(name), { method: 'DELETE' }); alert('Deleted'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnPutClientCohort').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); const n = $('clientCohort').value.trim(); if (!k || !n) return;
    try { await api('/clients/' + encodeURIComponent(k) + '/cohort', { method: 'PUT', body: JSON.stringify({ name: n }) }); alert('OK'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });

  $('btnDelClientCohort').addEventListener('click', async () => {
    const k = $('clientKey').value.trim(); if (!k) return;
    try { await api('/clients/' + encodeURIComponent(k) + '/cohort', { method: 'DELETE' }); alert('Deleted'); }
    catch(e){ alert('Error: ' + errToStr(e)); }
  });
})();

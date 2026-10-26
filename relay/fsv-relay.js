(function () {
  /*
   * FamilySearch Visualizer relay (SDD FR-34).
   *
   * It runs on familysearch.org, in the tab that the app opened, so that its requests carry the
   * user's own FamilySearch session. It answers only the two endpoints the app may read, only
   * to the app's origin, and only to the window that opened it. Nothing is stored.
   *
   * Keep ALLOWED_PATHS identical to src/api/allowList.ts: a test checks it.
   */
  var APP_ORIGINS = ['https://h-ssiqueira.github.io', 'http://localhost:5173', 'http://localhost:4173'];
  var FAMILYSEARCH_ORIGIN = 'https://www.familysearch.org';
  var ALLOWED_PATHS = [
    /^\/platform\/users\/current$/,
    /^\/service\/tree\/tree-data\/v8\/person\/[A-Z0-9]{2,8}-[A-Z0-9]{2,8}\/details$/i
  ];
  var APP_CHANNEL = 'fsv-app';
  var RELAY_CHANNEL = 'fsv-relay';

  if (!window.opener) {
    alert('Open this page from the FamilySearch Visualizer app first.');
    return;
  }

  function reply(target, origin, message) {
    message.channel = RELAY_CHANNEL;
    target.postMessage(message, origin);
  }

  function isAllowedUrl(url) {
    var parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      return false;
    }
    if (parsed.origin !== FAMILYSEARCH_ORIGIN) return false;
    if (parsed.search !== '' || parsed.hash !== '' || parsed.username !== '' || parsed.password !== '') {
      return false;
    }
    for (var i = 0; i < ALLOWED_PATHS.length; i += 1) {
      if (ALLOWED_PATHS[i].test(parsed.pathname)) return true;
    }
    return false;
  }

  window.addEventListener('message', function (event) {
    if (APP_ORIGINS.indexOf(event.origin) === -1) return;
    if (event.source !== window.opener) return;
    var data = event.data;
    if (!data || data.channel !== APP_CHANNEL) return;
    var target = event.source;
    var origin = event.origin;

    if (data.type === 'hello') {
      reply(target, origin, { type: 'ready' });
      return;
    }
    if (data.type !== 'request') return;

    var id = String(data.id);
    if (data.method !== 'GET' || !isAllowedUrl(String(data.url))) {
      reply(target, origin, { type: 'response', id: id, status: 403, body: '' });
      return;
    }

    var headers = {
      Accept: 'application/json',
      'Accept-Language': String(data.acceptLanguage || 'en')
    };
    if (data.token) headers.Authorization = 'Bearer ' + String(data.token);

    fetch(String(data.url), {
      method: 'GET',
      credentials: 'include',
      headers: headers,
      referrerPolicy: 'no-referrer'
    })
      .then(function (response) {
        var retryAfter = response.headers.get('Retry-After');
        return response.text().then(function (body) {
          reply(target, origin, {
            type: 'response',
            id: id,
            status: response.status,
            retryAfter: retryAfter,
            body: body
          });
        });
      })
      .catch(function () {
        reply(target, origin, { type: 'response', id: id, status: 502, body: '' });
      });
  });
})();

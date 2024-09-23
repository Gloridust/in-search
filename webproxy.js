const config = {
  upstream_path: '/',
  blocked_region: ['CU', 'IR', 'KP', 'SY'],
  blocked_ip_address: ['0.0.0.0', '127.0.0.1'],
  https: true,
  replace_dict: {
    '$upstream': '$custom_domain',
  },
  inject_script: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6862288297154364" crossorigin="anonymous"></script>',
  ads_txt_content: 'google.com, pub-6862288297154364, DIRECT, f08c47fec0942fa0',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/ads.txt') {
    return new Response(config.ads_txt_content, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const region = request.headers.get('cf-ipcountry')?.toUpperCase();
  const ip_address = request.headers.get('cf-connecting-ip');

  if (config.blocked_region.includes(region)) {
    return new Response('Access denied: Service is not available in your region.', { status: 403 });
  }
  if (config.blocked_ip_address.includes(ip_address)) {
    return new Response('Access denied: Your IP address is blocked.', { status: 403 });
  }

  let targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  const targetUrlObj = new URL(targetUrl);

  const newRequestInit = {
    method: request.method,
    headers: new Headers(request.headers),
    body: request.body,
    redirect: 'manual'
  };

  newRequestInit.headers.delete('host');
  newRequestInit.headers.set('origin', targetUrlObj.origin);
  newRequestInit.headers.set('referer', targetUrlObj.href);

  const newRequest = new Request(targetUrl, newRequestInit);

  try {
    const response = await fetch(newRequest);
    return await handleResponse(response, request, targetUrlObj);
  } catch (error) {
    return new Response(`Error fetching content: ${error.message}`, { status: 500 });
  }
}

async function handleResponse(response, originalRequest, targetUrl) {
  const contentType = response.headers.get('content-type');
  let body = response.body;

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      const newUrl = new URL(location, targetUrl.href);
      const proxyUrl = new URL(originalRequest.url);
      proxyUrl.searchParams.set('url', newUrl.href);
      return Response.redirect(proxyUrl.href, response.status);
    }
  }

  if (contentType && (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('application/javascript'))) {
    let text = await response.text();
    text = replaceUrls(text, targetUrl, new URL(originalRequest.url));
    text = injectScript(text);
    body = text;
  }

  const newHeaders = new Headers(response.headers);
  newHeaders.set('access-control-allow-origin', '*');
  newHeaders.set('access-control-allow-credentials', 'true');
  newHeaders.delete('content-security-policy');
  newHeaders.delete('content-security-policy-report-only');
  newHeaders.delete('clear-site-data');

  if (newHeaders.has('location')) {
    let location = newHeaders.get('location');
    const newLocationUrl = new URL(location, targetUrl.href);
    const proxyUrl = new URL(originalRequest.url);
    proxyUrl.searchParams.set('url', newLocationUrl.href);
    newHeaders.set('location', proxyUrl.href);
  }

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function replaceUrls(text, targetUrl, proxyUrl) {
  const rewriteUrl = (url) => {
    if (url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('#')) {
      return url;
    }
    const newUrl = new URL(url, targetUrl.href);
    const proxiedUrl = new URL(proxyUrl.href);
    proxiedUrl.searchParams.set('url', newUrl.href);
    return proxiedUrl.href;
  };

  // 替换 HTML 属性中的 URL
  text = text.replace(/(<[^>]+\s(href|src|action|data-src|srcset)=["'])(([^"'>]+)["'])/gi, (match, prefix, attr, value, url) => {
    if (attr.toLowerCase() === 'srcset') {
      const newSrcSet = url.split(',').map(src => {
        const [url, descriptor] = src.trim().split(/\s+/);
        return `${rewriteUrl(url)} ${descriptor || ''}`;
      }).join(', ');
      return `${prefix}${newSrcSet}"`;
    }
    return `${prefix}${rewriteUrl(url)}"`;
  });

  // 替换内联样式中的 URL
  text = text.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (match, quote, url) => {
    return `url(${quote}${rewriteUrl(url)}${quote})`;
  });

  // 替换 CSS 中的 @import
  text = text.replace(/@import\s+(['"])([^'"]+)\1/gi, (match, quote, url) => {
    return `@import ${quote}${rewriteUrl(url)}${quote}`;
  });

  // 替换 JavaScript 中的 URL（这可能会影响一些 JavaScript 代码，使用时需谨慎）
  text = text.replace(/((?:(?:href|src|url)\s*=\s*)|(?:(?:fetch|XMLHttpRequest\.open)\s*\(\s*))(["'])([^"']+)\2/gi, (match, prefix, quote, url) => {
    return `${prefix}${quote}${rewriteUrl(url)}${quote}`;
  });

  return text;
}

function injectScript(html) {
  const headRegex = /(<head(?:\s[^>]*)?>)/i;
  return html.replace(headRegex, `\$1${config.inject_script}`);
}

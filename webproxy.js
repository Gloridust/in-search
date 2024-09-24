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
    
    // 检查是否请求 /ads.txt
    if (url.pathname === '/ads.txt') {
      return new Response(config.ads_txt_content, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  
    const region = request.headers.get('cf-ipcountry')?.toUpperCase();
    const ip_address = request.headers.get('cf-connecting-ip');
  
    // 检查区域和IP限制
    if (config.blocked_region.includes(region)) {
      return new Response('Access denied: Service is not available in your region.', { status: 403 });
    }
    if (config.blocked_ip_address.includes(ip_address)) {
      return new Response('Access denied: Your IP address is blocked.', { status: 403 });
    }
  
    // 从查询参数中获取目标 URL
    let targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response('Missing target URL', { status: 400 });
    }
  
    // 确保目标 URL 有协议
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
  
    const targetUrlObj = new URL(targetUrl);
  
    // 创建新的请求
    const newRequestInit = {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
      redirect: 'manual'
    };
  
    // 移除或修改可能导致问题的头
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
  
    // 处理重定向
    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
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
  
    // 修改 Location 头，如果存在的话
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
    // 替换绝对路径
    text = text.replace(/((?:src|href|action)\s*=\s*["'])(https?:\/\/[^"']+)/gi, (match, prefix, url) => {
      const newUrl = new URL(url, targetUrl.href);
      const proxiedUrl = new URL(proxyUrl.href);
      proxiedUrl.searchParams.set('url', newUrl.href);
      return `${prefix}${proxiedUrl.href}`;
    });
  
    // 替换相对路径
    text = text.replace(/((?:src|href|action)\s*=\s*["'])(\/?[^"']+)/gi, (match, prefix, path) => {
      if (path.startsWith('data:') || path.startsWith('#')) return match;
      const newUrl = new URL(path, targetUrl.href);
      const proxiedUrl = new URL(proxyUrl.href);
      proxiedUrl.searchParams.set('url', newUrl.href);
      return `${prefix}${proxiedUrl.href}`;
    });
  
    // 替换内联样式中的 URL
    text = text.replace(/url\((['"]?)(https?:\/\/[^)]+|\/[^)]+)\1\)/gi, (match, quote, url) => {
      const newUrl = new URL(url, targetUrl.href);
      const proxiedUrl = new URL(proxyUrl.href);
      proxiedUrl.searchParams.set('url', newUrl.href);
      return `url(${quote}${proxiedUrl.href}${quote})`;
    });
  
    return text;
  }
  
  function injectScript(html) {
    const headRegex = /(<head(?:\s[^>]*)?>)/i;
    return html.replace(headRegex, `\$1${config.inject_script}`);
  }
  
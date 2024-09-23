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
    const user_agent = request.headers.get('user-agent');
  
    // 检查区域和IP限制
    if (config.blocked_region.includes(region)) {
      return new Response('Access denied: Service is not available in your region.', { status: 403 });
    }
    if (config.blocked_ip_address.includes(ip_address)) {
      return new Response('Access denied: Your IP address is blocked.', { status: 403 });
    }
  
    url.protocol = config.https ? 'https:' : 'http:';
    url.host = await device_status(user_agent) ? config.upstream : config.upstream_mobile;
    url.pathname = url.pathname === '/' ? config.upstream_path : config.upstream_path + url.pathname;
  
    const modifiedRequest = new Request(url.toString(), {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow'
    });
  
    try {
      const response = await fetch(modifiedRequest);
      const modifiedResponse = await modifyResponse(response, url.hostname, request.url);
      return modifiedResponse;
    } catch (error) {
      return new Response(`Error fetching content: ${error.message}`, { status: 500 });
    }
  }
  
  async function modifyResponse(response, upstream_domain, original_url) {
    const content_type = response.headers.get('content-type');
    let body = response.body;
  
    if (content_type && (content_type.includes('text/html') || content_type.includes('text/css') || content_type.includes('application/javascript'))) {
      let text = await response.text();
      text = replaceText(text, upstream_domain, new URL(original_url).hostname);
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
      location = replaceText(location, upstream_domain, new URL(original_url).hostname);
      newHeaders.set('location', location);
    }
  
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
  
  function replaceText(text, upstream_domain, custom_domain) {
    for (let [from, to] of Object.entries(config.replace_dict)) {
      from = from.replace('$upstream', upstream_domain).replace('$custom_domain', custom_domain);
      to = to.replace('$upstream', upstream_domain).replace('$custom_domain', custom_domain);
      
      const regex = new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      text = text.replace(regex, to);
    }
  
    return text;
  }
  
  function injectScript(html) {
    const headRegex = /(<head(?:\s[^>]*)?>)/i;
    return html.replace(headRegex, `\$1${config.inject_script}`);
  }
  
  async function device_status(user_agent_info) {
    const mobile_agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    return !mobile_agents.some(agent => user_agent_info.includes(agent));
  }
  
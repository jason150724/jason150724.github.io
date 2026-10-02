/* ============================================================
   所有页面共用的 JavaScript 小工具
   ============================================================ */

/** 管理员登录令牌：存在 sessionStorage 里（关闭浏览器标签页后自动消失） */
function getToken() {
  return sessionStorage.getItem('admin_token') || '';
}
function setToken(token) {
  sessionStorage.setItem('admin_token', token);
}
function clearToken() {
  sessionStorage.removeItem('admin_token');
}

/**
 * 向服务器发请求并拿回 JSON
 * @param {string} url    接口地址
 * @param {object} options 可选：{ method, body, auth }
 *   - method: 'GET' 或 'POST'
 *   - body:   要发送的 JS 对象（自动转 JSON）
 *   - auth:   true 时带上管理员令牌
 */
async function api(url, options) {
  options = options || {};
  const headers = { 'Content-Type': 'application/json' };
  if (options.auth && getToken()) {
    headers['Authorization'] = 'Bearer ' + getToken();
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* 不是 JSON 时忽略 */ }

  if (!res.ok) {
    throw new Error((data && data.error) || ('请求失败（' + res.status + '）'));
  }
  return data;
}

/* ---------------- 安全地显示用户输入的文字 ----------------
   防止有人提交带 <script> 的内容搞破坏（XSS） */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------------- 屏幕中上方的浮动小提示 ---------------- */
let toastTimer = null;
function toast(msg, type) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'show ' + (type || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 2600);
}

/* ---------------- 时间格式化：时间戳 -> "2026/10/01 14:30" ---------------- */
function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = n => (n < 10 ? '0' + n : n);
  return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/* ---------------- 生成统一的顶部导航栏 ----------------
   每个页面只要留一个 <div id="navbar"></div>，
   再调用 renderNavbar('home'|'submit'|'admin') 即可 */
function renderNavbar(active) {
  const box = document.getElementById('navbar');
  if (!box) return;
  box.innerHTML =
    '<nav class="navbar">' +
      '<a class="logo" href="index.html">🎮 游戏广场</a>' +
      '<a href="index.html" class="' + (active === 'home' ? 'active' : '') + '">主页</a>' +
      '<a href="submit.html" class="' + (active === 'submit' ? 'active' : '') + '">提交游戏</a>' +
      '<span class="spacer"></span>' +
      '<a href="admin.html" class="admin-link">管理员审核</a>' +
    '</nav>';
}

/* 取网址参数，例如 play.html?id=abc 里的 abc */
function getQuery(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

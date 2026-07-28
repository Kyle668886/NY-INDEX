// NY INDEX 南油趋势指数 - 真实档口数据版
// 所有档口数据来自 107/108/110栋 + 金晖大厦 + 网红档口 + 国风香云纱档口

document.addEventListener('DOMContentLoaded', () => {
  // ===== Beijing Time Update =====
  function updateBeijingTime() {
    const now = new Date();
    // 北京时间 = UTC+8
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);
    const h = beijing.getHours();
    const m = beijing.getMinutes();
    const timeStr = `${h}:${m < 10 ? '0' + m : m}`;
    document.querySelectorAll('.status-time').forEach(el => { el.textContent = timeStr; });
    // 更新首页问候语和日期
    const greetingEl = document.querySelector('.greeting-text');
    const dateEl = document.querySelector('.date-text');
    if (greetingEl) {
      let greeting = '晚上好，王总';
      if (h < 6) greeting = '凌晨了，王总';
      else if (h < 12) greeting = '早上好，王总';
      else if (h < 14) greeting = '中午好，王总';
      else if (h < 18) greeting = '下午好，王总';
      greetingEl.textContent = greeting;
    }
    if (dateEl) {
      const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
      const month = beijing.getMonth() + 1;
      const day = beijing.getDate();
      const wd = weekdays[beijing.getDay()];
      dateEl.textContent = `${month}月${day}日 ${wd}`;
    }
  }
  updateBeijingTime();
  setInterval(updateBeijingTime, 60000); // 每分钟更新

  // ===== Real Weather Data (Open-Meteo, 免费, 无需 Key) =====
  // 城市坐标映射
  const CITY_MAP = {
    '深圳 · 南油': { lat: 22.54, lon: 114.06, timezone: 'Asia/Shanghai', label: '深圳' },
    '上海 · 静安': { lat: 31.23, lon: 121.47, timezone: 'Asia/Shanghai', label: '上海' },
    '成都 · 高新': { lat: 30.57, lon: 104.07, timezone: 'Asia/Shanghai', label: '成都' },
    '北京 · 朝阳': { lat: 39.92, lon: 116.46, timezone: 'Asia/Shanghai', label: '北京' }
  };
  let currentCityKey = '深圳 · 南油';

  // WMO Weather Code → 中文描述 + 天气图标SVG
  function weatherDesc(code) {
    const m = {
      0:'晴',1:'晴间多云',2:'多云',3:'阴',
      45:'雾',48:'冻雾',
      51:'小毛毛雨',53:'毛毛雨',55:'大毛毛雨',
      56:'冻毛毛雨',57:'密集冻毛毛雨',
      61:'小雨',63:'中雨',65:'大雨',
      66:'冻雨',67:'大冻雨',
      71:'小雪',73:'中雪',75:'大雪',77:'雪粒',
      80:'小阵雨',81:'阵雨',82:'大阵雨',
      85:'小阵雪',86:'大阵雪',
      95:'雷暴',96:'雷暴冰雹',99:'强雷暴冰雹'
    };
    return m[code] || '未知';
  }
  function weatherIconSVG(code) {
    const isSunny = code <= 1;
    const isCloudy = (code >= 2 && code <= 3) || (code >= 45 && code <= 48);
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95);
    const isSnow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
    if (isSunny) return '<circle cx="24" cy="22" r="10" fill="#A78BFA"/><path d="M24 8v3M24 34v3M10 22h3M37 22h3M13 13l2 2M33 31l2 2M13 31l2 2M33 13l2 2" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>';
    if (isCloudy) return '<circle cx="24" cy="22" r="10" fill="#A78BFA"/><path d="M34 28c6 0 12 4 12 10s-4 8-12 8c-4 0-8-2-10-5" fill="#6B7288" opacity="0.4"/>';
    if (isRain) return '<circle cx="24" cy="22" r="8" fill="#6B7288" opacity="0.3"/><path d="M34 24c5 0 10 3 10 8s-3 7-10 7c-3 0-6-1-8-3" fill="#6B7288" opacity="0.4"/><path d="M20 38l2 4M26 38l2 4M32 38l2 4" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>';
    if (isSnow) return '<circle cx="24" cy="22" r="8" fill="#6B7288" opacity="0.3"/><path d="M34 24c5 0 10 3 10 8s-3 7-10 7c-3 0-6-1-8-3" fill="#6B7288" opacity="0.4"/><circle cx="20" cy="36" r="1.5" fill="#FFFFFF"/><circle cx="26" cy="40" r="1.5" fill="#FFFFFF"/><circle cx="32" cy="37" r="1.5" fill="#FFFFFF"/>';
    return '<circle cx="24" cy="22" r="10" fill="#A78BFA"/>';
  }
  function smallWeatherIconSVG(code) {
    const isSunny = code <= 1;
    const isCloudy = (code >= 2 && code <= 3) || (code >= 45 && code <= 48);
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95);
    const isSnow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
    if (isSunny) return '<circle cx="10" cy="9" r="5" fill="#A78BFA"/>';
    if (isCloudy) return '<circle cx="10" cy="9" r="5" fill="#A78BFA"/><path d="M17 15c3 0 5 2 5 4s-2 3-5 3c-2 0-4-1-5-3" fill="#6B7288" opacity="0.4"/>';
    if (isRain) return '<circle cx="10" cy="8" r="4" fill="#6B7288" opacity="0.3"/><path d="M16 13c3 0 5 2 5 4s-2 3-5 3c-2 0-3-1-4-2" fill="#6B7288" opacity="0.4"/>';
    if (isSnow) return '<circle cx="10" cy="8" r="4" fill="#6B7288" opacity="0.3"/>';
    return '<circle cx="10" cy="9" r="5" fill="#A78BFA"/>';
  }
  function uvLevel(uv) {
    if (uv <= 2) return '低';
    if (uv <= 5) return '<span class="gold">中等</span>';
    if (uv <= 7) return '<span style="color:#F97316">高</span>';
    if (uv <= 10) return '<span style="color:#F97316">很高</span>';
    return '<span style="color:#F97316">极高</span>';
  }
  function fashionInsight(maxTemps, codes, cityLabel) {
    const avg = maxTemps.reduce((a,b)=>a+b,0) / maxTemps.length;
    const rainyDays = codes.filter(c => c >= 51 && c <= 67 || c >= 80 && c <= 82 || c >= 95).length;
    let text = `${cityLabel || '深圳'}近7天平均最高温${Math.round(avg)}°C，`;
    if (avg >= 30) text += '持续高温，轻薄透气面料需求激增。建议关注：真丝、冰丝棉、薄纱类单品。老钱风淡色系搭配升温趋势明显。';
    else if (avg >= 25) text += '温暖舒适，适合薄针织+半裙通勤组合。建议关注：丝光棉、薄羊毛、亚麻面料档口。';
    else if (avg >= 20) text += '温度适中，春秋过渡穿搭为主。建议关注：薄外套、衬衫连衣裙、轻复古风。';
    else text += '气温偏低，保暖面料需求上升。建议关注：羊毛、羊绒、针织类档口。';
    if (rainyDays >= 3) text += ` 注意：近7天有${rainyDays}天降雨，雨具面料及防水单品值得关注。`;
    return text;
  }

  async function fetchWeather(cityKey) {
    const city = CITY_MAP[cityKey || currentCityKey];
    if (!city) return;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${city.timezone}&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      // 当前天气
      const cur = data.current;
      const tempEl = document.getElementById('w-temp');
      const descEl = document.getElementById('w-desc');
      const iconEl = document.getElementById('w-icon');
      const humEl = document.getElementById('w-humidity');
      const windEl = document.getElementById('w-wind');
      const uvEl = document.getElementById('w-uv');
      if (tempEl) tempEl.textContent = `${Math.round(cur.temperature_2m)}°C`;
      if (descEl) descEl.textContent = weatherDesc(cur.weather_code);
      if (iconEl) iconEl.innerHTML = weatherIconSVG(cur.weather_code);
      if (humEl) humEl.textContent = `${cur.relative_humidity_2m}%`;
      if (windEl) windEl.textContent = `${Math.round(cur.wind_speed_10m)}km/h`;
      if (uvEl) uvEl.innerHTML = uvLevel(cur.uv_index);

      // 7天预报
      const daily = data.daily;
      const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
      const nowBeijing = new Date(Date.now() + 8*3600000 + new Date().getTimezoneOffset()*60000);
      const todayStr = nowBeijing.toISOString().slice(0,10);
      const forecastEl = document.getElementById('w-forecast-list');
      if (forecastEl) {
        let html = '';
        daily.time.forEach((dateStr, i) => {
          const d = new Date(dateStr + 'T00:00:00+08:00');
          const dayLabel = dateStr === todayStr ? '今天' : weekdays[d.getDay()];
          const icon = smallWeatherIconSVG(daily.weather_code[i]);
          html += `<div class="forecast-item"><div class="forecast-left"><svg viewBox="0 0 24 24" fill="none">${icon}</svg><span>${dayLabel}</span></div><span class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</span></div>`;
        });
        forecastEl.innerHTML = html;
      }

      // 穿搭洞察
      const insightEl = document.getElementById('w-insight');
      if (insightEl) insightEl.textContent = fashionInsight(daily.temperature_2m_max, daily.weather_code, city.label);

      // 温度走势图
      const chartEl = document.getElementById('w-chart-area');
      if (chartEl) {
        const maxArr = daily.temperature_2m_max.map(v => Math.round(v));
        const minArr = daily.temperature_2m_min.map(v => Math.round(v));
        const allVals = [...maxArr, ...minArr];
        const minV = Math.min(...allVals) - 2;
        const maxV = Math.max(...allVals) + 2;
        const range = maxV - minV;
        const W = 326, H = 120, PAD = 10;
        function y(v) { return PAD + H - 2*PAD - ((v - minV) / range) * (H - 2*PAD); }
        function x(i) { return PAD + (i / (maxArr.length - 1)) * (W - 2*PAD); }
        // 高温线
        let highPts = maxArr.map((v,i) => `${x(i)} ${y(v)}`).join(' L');
        let lowPts = minArr.map((v,i) => `${x(i)} ${y(v)}`).join(' L');
        // 中线
        const midY = y(minV + range/2);
        const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart-svg">
          <line x1="0" y1="${midY}" x2="${W}" y2="${midY}" stroke="#E5E7EB" stroke-width="0.5"/>
          <path d="M${highPts}" stroke="#A78BFA" stroke-width="2" fill="none" stroke-linejoin="round"/>
          <path d="M${lowPts}" stroke="#10B981" stroke-width="2" fill="none" stroke-linejoin="round"/>
        </svg>`;
        chartEl.innerHTML = svg;
      }
    } catch (e) {
      console.error('Weather fetch failed:', e);
      const tempEl = document.getElementById('w-temp');
      if (tempEl) tempEl.textContent = '数据加载失败';
      const descEl = document.getElementById('w-desc');
      if (descEl) descEl.textContent = '请刷新重试';
    }
  }
  fetchWeather();
  // 每30分钟刷新一次天气
  setInterval(fetchWeather, 30 * 60 * 1000);

  // ===== Screen Management =====
  const screenNames = ['home','trend','brand','shop','stores','ai','content','bi','weather','recruit','findstyle','banshan','tasks','me','login','aicloth'];
  const screens = {};
  screenNames.forEach(name => { screens[name] = document.getElementById(`screen-${name}`); });

  let currentScreen = 'home';

  function showScreen(name) {
    if (!screens[name]) { console.warn('Screen not found:', name); return; }
    Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
    screens[name].classList.add('active');
    currentScreen = name;
    document.querySelectorAll('.tab-pill').forEach(pill => {
      pill.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      const match = pill.querySelector(`[data-screen="${name}"]`);
      if (match) match.classList.add('active');
    });
    const content = screens[name]?.querySelector('.screen-content');
    if (content) content.scrollTop = 0;
    closeModal();
  }

  // Tab click handlers
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => { e.stopPropagation(); const target = tab.dataset.screen; if (target) showScreen(target); });
  });
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); showScreen(btn.dataset.back || 'home'); });
  });
  document.querySelectorAll('.quick-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); const target = btn.dataset.screen; if (target) showScreen(target); });
  });
  document.querySelectorAll('.more-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); const target = btn.dataset.screen; if (target) showScreen(target); });
  });

  // ===== Modal System =====
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  function openModal(title, html) {
    if (!modalOverlay) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalOverlay.classList.add('active');
    bindModalActions();
  }
  function closeModal() { if (modalOverlay) modalOverlay.classList.remove('active'); }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  window.closeModal = closeModal;

  function bindClick(selector, handler) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => { e.stopPropagation(); handler(el, e); });
    });
  }

  function bindModalActions() {
    const copyBtn = modalBody?.querySelector('.btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = copyBtn.dataset.type;
        copyContent(type);
        copyBtn.textContent = '已复制 ✓';
        copyBtn.style.background = '#10B981';
        setTimeout(() => { copyBtn.textContent = '复制内容'; copyBtn.style.background = ''; }, 2000);
      });
    }
    const editBtn = modalBody?.querySelector('.btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const preEl = modalBody?.querySelector('.dm-pre');
        if (preEl && !preEl.isContentEditable) {
          preEl.contentEditable = 'true';
          preEl.style.border = '1px solid var(--accent-gold)';
          preEl.style.borderRadius = '8px';
          preEl.style.padding = '8px';
          preEl.focus();
          editBtn.textContent = '完成编辑';
          editBtn.style.background = '#10B981';
          editBtn.style.color = '#FFFFFF';
        } else if (preEl && preEl.isContentEditable) {
          preEl.contentEditable = 'false';
          preEl.style.border = 'none';
          preEl.style.padding = '';
          editBtn.textContent = '编辑修改';
          editBtn.style.background = '';
          editBtn.style.color = '';
        }
      });
    }
  }

  function copyContent(type) {
    const tmpl = contentTemplates[type];
    if (!tmpl) return;
    const text = tmpl.text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; textarea.style.left = '-9999px'; textarea.style.top = '-9999px'; textarea.style.opacity = '0';
    document.body.appendChild(textarea); textarea.focus(); textarea.select();
    try { document.execCommand('copy'); } catch (err) { alert('请长按以下文字手动复制：\n\n' + text); }
    document.body.removeChild(textarea);
  }

  // ===== DATA =====
  const trendData = {
    styles: [
      { name: '老钱风', score: 92, growth: '+3.2', lifecycle: '成熟期', risk: 2, recommend: 9, tags: ['驼色系','羊毛羊绒','西装大衣'], desc: '经典高端风格，源自欧美上阶层审美，强调低调奢华与品质感。米白、驼色、深灰为核心色系，羊毛/羊绒材质是关键面料。' },
      { name: '静奢风', score: 88, growth: '+2.8', lifecycle: '上升期', risk: 3, recommend: 8, tags: ['淡色系','真丝','极简剪裁'], desc: '追求品质而非品牌的消费心态，淡雅配色、简洁线条、高级面料。真丝与薄纱面料需求增长明显。' },
      { name: '新中式', score: 76, growth: '+18.3', lifecycle: '爆发期', risk: 5, recommend: 7, tags: ['东方元素','改良旗袍','刺绣'], desc: '国潮觉醒后的高客单升级版本，将东方元素融入现代剪裁。改良旗袍、刺绣细节成为亮点。' },
      { name: '极简通勤', score: 69, growth: '+1.5', lifecycle: '稳定期', risk: 1, recommend: 6, tags: ['黑白灰','西装','衬衫'], desc: '职场女性日常穿搭刚需，稳定需求但增长放缓。' },
      { name: '街头机能', score: 63, growth: '-2.1', lifecycle: '衰退期', risk: 7, recommend: 3, tags: ['机能风','拼接','多口袋'], desc: '风格热度下降，建议减少相关备货。高客单市场接受度有限。' },
    ],
    colors: [
      { name: '驼色系', score: 90, growth: '+4.5', lifecycle: '成熟期', risk: 2, recommend: 9, tags: ['驼色','米白','燕麦'], desc: '高端女装永恒色系，老钱风和静奢风的核心配色。' },
      { name: '黑白灰', score: 85, growth: '+1.2', lifecycle: '稳定期', risk: 1, recommend: 7, tags: ['纯黑','灰调','白色'], desc: '通勤基础色，全年稳定需求。' },
      { name: '东方色', score: 78, growth: '+15.6', lifecycle: '爆发期', risk: 5, recommend: 8, tags: ['朱砂红','墨绿','茶色'], desc: '新中式风格带动的色系增长。' },
      { name: '淡粉系', score: 65, growth: '+3.8', lifecycle: '上升期', risk: 4, recommend: 6, tags: ['淡粉','裸粉','腮红'], desc: '春夏季节性需求上升。' },
      { name: '电光蓝', score: 52, growth: '-1.5', lifecycle: '衰退期', risk: 8, recommend: 2, tags: ['电光蓝','钴蓝','亮蓝'], desc: '高饱和度蓝色热度下降。' },
    ],
    fabrics: [
      { name: '羊毛/羊绒', score: 93, growth: '+5.2', lifecycle: '成熟期', risk: 2, recommend: 9, tags: ['羊绒大衣','羊毛西装','针织'], desc: '高端面料王者，老钱风核心材质。' },
      { name: '真丝', score: 82, growth: '+6.8', lifecycle: '上升期', risk: 3, recommend: 8, tags: ['真丝衬衫','丝绸裙','薄纱'], desc: '静奢风带动的面料增长。' },
      { name: '改良织锦', score: 74, growth: '+12.3', lifecycle: '爆发期', risk: 5, recommend: 7, tags: ['织锦','刺绣','提花'], desc: '新中式风格面料增长。' },
      { name: '冰丝棉', score: 68, growth: '+4.5', lifecycle: '上升期', risk: 2, recommend: 6, tags: ['冰丝','棉麻','透气'], desc: '夏季刚需面料，透气轻薄。' },
      { name: '合成皮革', score: 48, growth: '-3.2', lifecycle: '衰退期', risk: 7, recommend: 2, tags: ['PU皮','仿皮','拼接皮'], desc: '环保趋势下热度持续下降。' },
    ]
  };

  const brandData = {
    hot: [
      { name: 'MUSE', logo: 'M', color: 'gold', tag: '极简 · 高奢 · 复购率92%', score: 98, story: 'MUSE是南油高端女装标杆品牌，专注于极简高端风格。品牌DNA为「克制的美学」', dna: '克制美学、低调奢华', colors: '米白、驼色、深灰', fabrics: '羊绒、羊毛、真丝', styles: '极简、高奢', hotItems: '羊绒大衣、驼色西装', trend: '持续上涨 +12%', match: '96%' },
      { name: 'LAN', logo: 'L', color: '', tag: '新中式 · 轻奢 · 热度+18%', score: 95, story: 'LAN以新中式轻奢为核心定位。', dna: '东方诗意、现代简约', colors: '朱砂红、墨绿、茶色', fabrics: '织锦、刺绣、丝绸', styles: '新中式、轻奢', hotItems: '改良旗袍、刺绣外套', trend: '爆发增长 +18%', match: '89%' },
      { name: 'O2ND', logo: 'O', color: '', tag: '韩系 · 通勤 · 热度+12%', score: 91, story: 'O2ND是韩系通勤风格代表品牌。', dna: '实用美学、都市感', colors: '黑白灰、淡粉、奶茶色', fabrics: '冰丝棉、羊毛', styles: '韩系、通勤', hotItems: '剪裁衬衫、半裙', trend: '稳定增长 +12%', match: '85%' },
      { name: 'VIKTORIACHAN', logo: 'V', color: '', tag: '静奢风 · 小众 · 热度+9%', score: 88, story: '静奢风小众设计师品牌。', dna: '独特质感、静奢美学', colors: '淡色系、灰调', fabrics: '针织、羊毛、真丝混纺', styles: '静奢、小众设计师', hotItems: '针织开衫、质感外套', trend: '上升 +9%', match: '82%' },
      { name: 'YOEYYOU', logo: 'Y', color: '', tag: '极简 · 通勤 · 热度+7%', score: 85, story: '极简通勤风格品牌。', dna: '极简实用、职场美学', colors: '黑白灰、深蓝', fabrics: '羊毛、涤纶、棉', styles: '极简、通勤', hotItems: '西装裤、剪裁西装', trend: '稳定 +7%', match: '78%' },
    ],
    luxury: [
      { name: 'Loro Piana', logo: 'LP', color: 'gold', tag: '意大利 · 极奢 · 羊绒之王', score: 99, story: '意大利顶级羊绒品牌。', dna: '极致品质、低调奢华', colors: '驼色、米白、深灰', fabrics: '羊绒、cashmere、美利奴羊毛', styles: '老钱风、极奢', hotItems: '羊绒大衣、驼色开衫', trend: '全球老钱风标杆', match: '99%' },
      { name: 'The Row', logo: 'R', color: 'gold', tag: '美国 · 极简高奢 · 静奢标杆', score: 97, story: '静奢风全球标杆品牌。', dna: '极致极简、静奢标杆', colors: '黑、白、驼、灰', fabrics: '羊绒、真丝、皮革', styles: '静奢、极简高奢', hotItems: '极简大衣、真丝衬衫', trend: '静奢全球引领者', match: '97%' },
      { name: 'Brunello Cucinelli', logo: 'BC', color: 'gold', tag: '意大利 · 老钱风 · 人文奢华', score: 96, story: '意大利老钱风代表品牌。', dna: '人文奢华、匠心工艺', colors: '驼色、米白、灰棕', fabrics: '羊绒、手工编织', styles: '老钱风、人文奢华', hotItems: '羊绒外套、手工针织', trend: '老钱风持续走强', match: '96%' },
      { name: 'Max Mara', logo: 'MM', color: 'gold', tag: '意大利 · 经典大衣 · 女装之王', score: 94, story: '以大衣闻名全球的经典品牌。', dna: '经典优雅、大衣之王', colors: '驼色、黑、白', fabrics: '羊绒、羊毛、驼毛', styles: '经典、通勤', hotItems: '驼色大衣、西装外套', trend: '经典稳定', match: '94%' },
      { name: 'Toteme', logo: 'T', color: 'gold', tag: '瑞典 · 静奢 · 极简剪裁', score: 92, story: '瑞典静奢风品牌。', dna: '北欧极简、静奢剪裁', colors: '白、驼、灰', fabrics: '真丝、羊毛', styles: '静奢、极简', hotItems: '剪裁大衣、真丝裙', trend: '静奢增长最快', match: '92%' },
    ],
    designer: [
      { name: 'RUOHAN', logo: 'R', color: 'coral', tag: '中国 · 静奢 · 极简', score: 88, story: '中国独立设计师品牌，静奢极简风格。', dna: '东方极简、静奢诗意', colors: '白、灰、淡粉', fabrics: '真丝、针织', styles: '静奢、极简', hotItems: '真丝连衣裙、针织外套', trend: '独立设计师+15%', match: '88%' },
      { name: 'UMAWANG', logo: 'U', color: 'gold', tag: '中国 · 东方高奢 · 文化表达', score: 86, story: '东方高奢设计师品牌。', dna: '东方文化、高奢表达', colors: '墨绿、朱砂红、茶色', fabrics: '织锦、刺绣、丝绸', styles: '东方、高奢', hotItems: '织锦外套、改良旗袍', trend: '东方风格增长+12%', match: '86%' },
      { name: 'DEEPMOSS', logo: 'D', color: 'green', tag: '中国 · 艺术 · 小众', score: 84, story: '艺术小众设计师品牌。', dna: '艺术美学、小众独特', colors: '灰调、暗色系', fabrics: '混纺、特殊面料', styles: '艺术、小众', hotItems: '艺术连衣裙', trend: '小众热度+10%', match: '84%' },
      { name: 'EENK', logo: 'E', color: 'gold', tag: '韩国 · 轻奢 · 艺术感', score: 82, story: '韩国轻奢艺术感品牌。', dna: '艺术轻奢、韩系美学', colors: '奶茶色、淡色系', fabrics: '真丝、棉麻', styles: '韩系、轻奢', hotItems: '艺术衬衫、轻奢半裙', trend: '韩系轻奢+8%', match: '82%' },
    ],
    niche: [
      { name: 'Lemaire', logo: 'L', color: '', tag: '法国 · 极简 · 静奢', score: 83, story: '法国极简静奢品牌。', dna: '折纸美学、极简静奢', colors: '白、驼、灰', fabrics: '真丝、棉、羊毛', styles: '极简、静奢', hotItems: '折纸大衣、真丝衬衫', trend: '静奢增长+10%', match: '83%' },
      { name: 'Jil Sander', logo: 'J', color: '', tag: '德国 · 极简 · 纯粹', score: 80, story: '德国极简品牌。', dna: '纯粹极简、线条美学', colors: '白、黑、灰', fabrics: '羊毛、真丝、棉', styles: '极简', hotItems: '极简大衣', trend: '极简稳定+6%', match: '80%' },
      { name: 'Theory', logo: 'T', color: '', tag: '美国 · 通勤 · 极简实用', score: 78, story: '通勤极简品牌。', dna: '实用极简、职场美学', colors: '黑、灰、白', fabrics: '羊毛、棉', styles: '通勤、极简', hotItems: '通勤西装', trend: '通勤稳定+5%', match: '78%' },
    ]
  };

  const allBrands = [];
  for (const [cat, list] of Object.entries(brandData)) { list.forEach(b => allBrands.push({ ...b, category: cat })); }

  // ===== REAL SHOP DATA =====
  // 数据来源：107/108/110栋档口号.docx + 金晖档口号.docx
  const shopData = {
    'oldmoney': [ // 极简老钱风
      { name: 'PIETAS', building: '111栋', floor: '167F', room: '167', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 9, stability: 8, delivery: 9, aiScore: 96 },
      { name: 'GAL', building: '天安', floor: '', room: 'D703', style: '极简老钱风', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 7, delivery: 8, aiScore: 74 },
      { name: 'YMY', building: '110栋', floor: '', room: 'E52', style: '极简老钱风', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 8, delivery: 8, aiScore: 72 },
      { name: '集简', building: '110栋', floor: '2F', room: 'B49', style: '极简老钱风', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 9, stability: 9, delivery: 9, aiScore: 84 },
      { name: '老佛爷', building: '111栋', floor: '3F', room: 'C310', style: '极简老钱风', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 10, stability: 7, delivery: 7, aiScore: 85 },
      { name: 'CHIC JISHE', building: '新街口', floor: '', room: '5', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 10, stability: 9, delivery: 9, aiScore: 85 },
      { name: 'Frame Fan', building: '110栋', floor: '2F', room: 'B', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 10, stability: 7, delivery: 9, aiScore: 74 },
      { name: '颖家', building: '111栋', floor: '113F', room: '113', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 7, stability: 8, delivery: 8, aiScore: 80 },
      { name: '积美', building: '111栋', floor: '1F', room: '150', style: '极简老钱风', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 9, delivery: 7, aiScore: 85 },
      { name: '紫墨', building: '110栋', floor: '3F', room: 'B38', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 9, stability: 9, delivery: 9, aiScore: 80 },
      { name: 'Segovia', building: '尚道', floor: '', room: '616', style: '极简老钱风', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 9, stability: 8, delivery: 8, aiScore: 90 },
      { name: 'Ray.Ray', building: '110栋', floor: '', room: 'F46A', style: '极简老钱风', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 9, stability: 9, delivery: 9, aiScore: 93 },
      { name: 'NOVELAIRE', building: '111栋', floor: '135F', room: '135', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 8, stability: 8, delivery: 8, aiScore: 93 },
      { name: '玉茁', building: '尚道', floor: '', room: '607A', style: '极简老钱风', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 8, delivery: 7, aiScore: 73 },
      { name: '金子', building: '111栋', floor: '4F', room: 'A20', style: '极简老钱风', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 7, stability: 7, delivery: 8, aiScore: 80 },
      { name: '东珠才让', building: '111栋', floor: '167F', room: '167', style: '极简老钱风', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 8, stability: 7, delivery: 9, aiScore: 76 },
      { name: 'YOUXU右续', building: '尚道', floor: '', room: '319', style: '极简老钱风', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 8, stability: 7, delivery: 7, aiScore: 77 },
      { name: 'PAN', building: '聚道A29', floor: '', room: '聚道A29', style: '极简老钱风', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 9, stability: 9, delivery: 7, aiScore: 74 },
    ],
    'guofeng': [ // 新中式国风
      { name: '国朴', building: '103栋', floor: '1F', room: 'A29', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 9, stability: 9, delivery: 7, aiScore: 95 },
      { name: '漫花林', building: '103栋', floor: '1F', room: 'A68', style: '新中式国风', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 8, delivery: 7, aiScore: 88 },
      { name: '扇子', building: '103栋', floor: '1F', room: 'A61', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 9, stability: 9, delivery: 8, aiScore: 81 },
      { name: '云谷', building: '103栋', floor: '1F', room: 'A55', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 7, stability: 9, delivery: 9, aiScore: 84 },
      { name: '三山半', building: '103栋', floor: '2F', room: '219', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 7, stability: 7, delivery: 9, aiScore: 90 },
      { name: '手作生活', building: '103栋', floor: '2F', room: '227', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 8, stability: 8, delivery: 8, aiScore: 85 },
      { name: '晒谷场', building: '103栋', floor: '1F', room: 'A22', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 9, stability: 8, delivery: 7, aiScore: 82 },
      { name: '竹锦', building: '103栋', floor: '1F', room: 'A62', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 7, stability: 8, delivery: 9, aiScore: 79 },
      { name: '奕间', building: '103栋', floor: '1F', room: 'A50', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 7, delivery: 9, aiScore: 80 },
      { name: '盛唐未央', building: '103栋', floor: '1F', room: 'A07', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 8, stability: 8, delivery: 8, aiScore: 81 },
      { name: '锦衣薇', building: '103栋', floor: '1F', room: 'A03', style: '新中式国风', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 7, delivery: 9, aiScore: 85 },
      { name: '遇见天', building: '103栋', floor: '1F', room: 'A88', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 7, delivery: 9, aiScore: 75 },
      { name: '春夏荷', building: '103栋', floor: '1F', room: 'A17', style: '新中式国风', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 9, delivery: 7, aiScore: 73 },
      { name: '三生织玺', building: '109栋', floor: '', room: 'A08', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 9, delivery: 9, aiScore: 85 },
      { name: '曦晨', building: '110栋', floor: '2F', room: 'C7', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 10, stability: 7, delivery: 8, aiScore: 96 },
      { name: '蔓妃', building: '109栋', floor: '3F', room: 'C61', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 9, stability: 9, delivery: 9, aiScore: 83 },
      { name: '刷卡', building: '110栋', floor: '3F', room: 'B060', style: '新中式国风', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 8, stability: 7, delivery: 9, aiScore: 73 },
      { name: '尚层衣卿', building: '109栋', floor: '1F', room: 'A20C', style: '新中式国风', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 10, stability: 8, delivery: 9, aiScore: 78 },
    ],
    'judao': [ // 聚道档口
      { name: '色子', building: '聚道', floor: '2F', room: 'B51', style: '聚道档口', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 9, stability: 8, delivery: 7, aiScore: 87 },
      { name: 'ETH', building: '聚道', floor: '2F', room: 'B206', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 8, delivery: 7, aiScore: 84 },
      { name: '主章', building: '聚道', floor: '2F', room: 'B05', style: '聚道档口', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 8, stability: 7, delivery: 9, aiScore: 79 },
      { name: 'DAMO WANG', building: '聚道', floor: '2F', room: 'B01', style: '聚道档口', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 7, delivery: 9, aiScore: 90 },
      { name: 'AOSE', building: '聚道', floor: '3F', room: 'C18', style: '聚道档口', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 8, stability: 8, delivery: 9, aiScore: 92 },
      { name: 'YUMOO', building: '聚道', floor: '3F', room: 'C17', style: '聚道档口', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 8, delivery: 7, aiScore: 79 },
      { name: '周卓仕林', building: '聚道', floor: '4F', room: 'D01', style: '聚道档口', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 7, delivery: 8, aiScore: 79 },
      { name: 'NW80EN', building: '聚道', floor: '3F', room: 'C06', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 7, stability: 7, delivery: 8, aiScore: 75 },
      { name: '乌陌', building: '聚道', floor: '1F', room: '7号仓', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 9, delivery: 8, aiScore: 77 },
      { name: '悠路铭衫', building: '聚道', floor: '1F', room: 'A55', style: '聚道档口', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 7, delivery: 8, aiScore: 91 },
      { name: '一琢', building: '聚道', floor: '1F', room: 'A6013', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 8, delivery: 8, aiScore: 81 },
      { name: '卡西特', building: '聚道', floor: '4F', room: 'D10', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 10, stability: 7, delivery: 8, aiScore: 84 },
      { name: 'KIMUSSO', building: '聚道', floor: '1F', room: 'A16', style: '聚道档口', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 7, stability: 7, delivery: 7, aiScore: 96 },
      { name: 'DRESS or DIE', building: '聚道', floor: '1F', room: 'A18', style: '聚道档口', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 9, stability: 7, delivery: 7, aiScore: 74 },
      { name: 'FENGGY', building: '聚道', floor: '3F', room: 'C01', style: '聚道档口', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 9, stability: 8, delivery: 8, aiScore: 73 },
      { name: '独序', building: '聚道', floor: '2F', room: 'B208', style: '聚道档口', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 8, stability: 9, delivery: 8, aiScore: 80 },
      { name: 'SEYDOUS赛度', building: '聚道', floor: '3F', room: 'C313', style: '聚道档口', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 8, stability: 9, delivery: 8, aiScore: 72 },
      { name: 'JIA MEI', building: '聚道', floor: '3F', room: 'C25', style: '聚道档口', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 7, stability: 9, delivery: 9, aiScore: 74 },
    ],
    'resort': [ // 度假连衣裙
      { name: 'cici', building: '贵航', floor: '', room: '499', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 9, delivery: 9, aiScore: 77 },
      { name: '萍家', building: '108栋', floor: '', room: '二楼238', style: '度假风连衣裙', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 9, stability: 7, delivery: 8, aiScore: 95 },
      { name: '微风', building: '110栋', floor: '4F', room: 'B37', style: '度假风连衣裙', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 7, stability: 8, delivery: 7, aiScore: 96 },
      { name: '古怪', building: '110栋', floor: '2F', room: 'B6B', style: '度假风连衣裙', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 8, delivery: 8, aiScore: 87 },
      { name: '巨松', building: '110B栋', floor: '4F', room: '-B01', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 7, delivery: 9, aiScore: 90 },
      { name: 'Coco', building: '110栋', floor: '4F', room: 'B20B', style: '度假风连衣裙', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 8, stability: 9, delivery: 8, aiScore: 87 },
      { name: '玥玥', building: '贵航', floor: '2F', room: '265', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 8, stability: 8, delivery: 8, aiScore: 86 },
      { name: '小花', building: '110C栋', floor: '3F', room: '-10', style: '度假风连衣裙', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 10, stability: 9, delivery: 9, aiScore: 81 },
      { name: '秀秀', building: '贵航', floor: '', room: '522', style: '度假风连衣裙', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 9, stability: 8, delivery: 9, aiScore: 82 },
      { name: 'Yik', building: '112栋', floor: '2F', room: 'B19', style: '度假风连衣裙', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 9, stability: 9, delivery: 8, aiScore: 78 },
      { name: '小柒', building: '107栋', floor: '3F', room: '326', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 7, stability: 8, delivery: 8, aiScore: 78 },
      { name: '元一', building: '105A111', floor: '', room: '105A111', style: '度假风连衣裙', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 9, stability: 9, delivery: 7, aiScore: 77 },
      { name: '大小何', building: '108栋', floor: '1F', room: '112', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 8, stability: 9, delivery: 8, aiScore: 87 },
      { name: '丫丫', building: '108栋', floor: '1F', room: '109', style: '度假风连衣裙', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 7, delivery: 7, aiScore: 87 },
      { name: '雾浓', building: '209栋', floor: '', room: 'C212', style: '度假风连衣裙', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 10, stability: 8, delivery: 9, aiScore: 90 },
      { name: '上善', building: '110栋', floor: '', room: 'B-F19', style: '度假风连衣裙', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 7, delivery: 7, aiScore: 92 },
      { name: 'YING CHOI', building: '110栋', floor: '', room: 'E60A', style: '度假风连衣裙', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 9, stability: 8, delivery: 9, aiScore: 88 },
      { name: '翩翩', building: '111栋', floor: '2F', room: 'A115', style: '度假风连衣裙', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 7, delivery: 9, aiScore: 91 },
    ],
    '108': [ // 108栋
      { name: '高品牛仔裤', building: '108栋', floor: '303F', room: 'B', style: '108栋热门', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 8, stability: 9, delivery: 7, aiScore: 90 },
      { name: '萍家', building: '108栋', floor: '238F', room: '238', style: '108栋热门', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 8, delivery: 7, aiScore: 86 },
      { name: 'Izhou', building: '108栋', floor: '', room: 'A36B', style: '108栋热门', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 8, stability: 9, delivery: 8, aiScore: 85 },
      { name: 'U范', building: '108栋', floor: '', room: 'B22', style: '108栋热门', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 8, delivery: 8, aiScore: 87 },
      { name: '吉蜜JM', building: '108栋', floor: '', room: 'C29', style: '108栋热门', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 8, stability: 8, delivery: 7, aiScore: 73 },
      { name: 'TTVN', building: '108栋', floor: '', room: 'D17', style: '108栋热门', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 7, delivery: 8, aiScore: 86 },
      { name: '千百度', building: '108栋', floor: '256F', room: 'A', style: '108栋热门', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 10, stability: 8, delivery: 8, aiScore: 95 },
      { name: '张家', building: '108栋', floor: '130F', room: '130', style: '108栋热门', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 8, stability: 9, delivery: 8, aiScore: 93 },
      { name: 'As Secret', building: '108栋', floor: '', room: 'A20', style: '108栋热门', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 9, stability: 8, delivery: 9, aiScore: 94 },
      { name: 'He和家', building: '108栋', floor: '261F', room: '261', style: '108栋热门', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 10, stability: 7, delivery: 9, aiScore: 74 },
      { name: '大喜门', building: '108栋', floor: '', room: 'A07', style: '108栋热门', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 8, stability: 9, delivery: 8, aiScore: 91 },
      { name: 'Abitya红桃', building: '108栋', floor: '', room: 'A13', style: '108栋热门', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 9, stability: 8, delivery: 8, aiScore: 84 },
      { name: 'Dot comme', building: '108栋', floor: '', room: 'C38', style: '108栋热门', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 8, delivery: 9, aiScore: 88 },
      { name: '爱舍ZouPing', building: '108栋', floor: '', room: 'D27', style: '108栋热门', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 8, stability: 8, delivery: 7, aiScore: 85 },
      { name: 'FangYiJia方依', building: '108栋', floor: '', room: 'A36', style: '108栋热门', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 8, delivery: 7, aiScore: 95 },
      { name: 'MaisonMeet梅森', building: '108栋', floor: '', room: 'D29', style: '108栋热门', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 8, stability: 7, delivery: 9, aiScore: 74 },
      { name: 'Aose傲色', building: '108栋', floor: '', room: 'A29', style: '108栋热门', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 7, stability: 7, delivery: 9, aiScore: 94 },
      { name: 'HuaFeng画风', building: '108栋', floor: '', room: 'B01', style: '108栋热门', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 7, stability: 8, delivery: 7, aiScore: 82 },
    ],
    '107': [ // 107栋
      { name: 'by carrie Cyan粉标', building: '107栋', floor: '', room: 'C16', style: '107栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 8, stability: 7, delivery: 7, aiScore: 76 },
      { name: '蛇蛇', building: '107栋', floor: '305F', room: '305', style: '107栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 10, stability: 8, delivery: 9, aiScore: 83 },
      { name: 'Segovia塞格维亚', building: '107栋', floor: '', room: 'D01', style: '107栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 10, stability: 8, delivery: 8, aiScore: 95 },
      { name: '日月星RYX', building: '107栋', floor: '', room: 'C27', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 9, stability: 8, delivery: 8, aiScore: 90 },
      { name: '玫瑰人生', building: '107栋', floor: '2F', room: 'D09', style: '107栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 8, delivery: 7, aiScore: 84 },
      { name: '日向RiXiang', building: '107栋', floor: '', room: 'B38', style: '107栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 10, stability: 9, delivery: 8, aiScore: 74 },
      { name: '锦轩', building: '107栋', floor: '302F', room: '302', style: '107栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 8, stability: 8, delivery: 8, aiScore: 79 },
      { name: '钱袋子', building: '107栋', floor: '3F', room: '316', style: '107栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 7, delivery: 8, aiScore: 92 },
      { name: '华家里', building: '107栋', floor: '310F', room: 'A', style: '107栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 8, delivery: 9, aiScore: 94 },
      { name: '一身YiShen', building: '107栋', floor: '2F', room: 'F01', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 8, stability: 9, delivery: 9, aiScore: 75 },
      { name: '无印', building: '107栋', floor: '', room: 'A26', style: '107栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 7, delivery: 9, aiScore: 78 },
      { name: 'MONGYEAH', building: '107栋', floor: '2F', room: '18', style: '107栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 8, stability: 8, delivery: 8, aiScore: 78 },
      { name: 'SCF', building: '107栋', floor: '', room: 'B09', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 8, stability: 9, delivery: 8, aiScore: 78 },
      { name: '安婕皮草', building: '107栋', floor: '405F', room: '405', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 8, delivery: 8, aiScore: 87 },
      { name: '奢原色', building: '107栋', floor: '2F', room: 'E11', style: '107栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 7, stability: 8, delivery: 7, aiScore: 82 },
      { name: '集简', building: '107栋', floor: '2F', room: 'E15A', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 8, delivery: 8, aiScore: 96 },
      { name: '伊柜', building: '107栋', floor: '3F', room: '301', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 7, delivery: 7, aiScore: 82 },
      { name: 'Pristine', building: '107栋', floor: '1F', room: 'B07', style: '107栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 7, stability: 9, delivery: 9, aiScore: 76 },
    ],
    '110': [ // 110栋
      { name: 'JIN RONG锦荣', building: '110栋', floor: '2F', room: 'A2', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 9, stability: 9, delivery: 8, aiScore: 79 },
      { name: 'THE NORA', building: '110栋', floor: '1F', room: '10', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 8, stability: 8, delivery: 9, aiScore: 92 },
      { name: 'Lemon柠檬', building: '110栋', floor: '1F', room: 'E11', style: '110栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 9, delivery: 7, aiScore: 83 },
      { name: 'ARIES YU', building: '110栋', floor: '1F', room: 'E12', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 9, delivery: 7, aiScore: 84 },
      { name: 'SUNEXIII上晞', building: '110栋', floor: '1F', room: 'E43', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 8, stability: 7, delivery: 7, aiScore: 79 },
      { name: 'AS SECRET', building: '110栋', floor: '1F', room: 'E31', style: '110栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 7, stability: 9, delivery: 8, aiScore: 91 },
      { name: '本奥', building: '110栋', floor: '2F', room: 'A23', style: '110栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 7, delivery: 9, aiScore: 92 },
      { name: '花样', building: '110栋', floor: '', room: 'C333', style: '110栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 8, stability: 7, delivery: 9, aiScore: 82 },
      { name: '微风', building: '110栋', floor: '3F', room: 'C308A', style: '110栋宝藏', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 8, stability: 7, delivery: 7, aiScore: 90 },
      { name: '紫晨', building: '110栋', floor: '3F', room: 'B18', style: '110栋宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 10, stability: 7, delivery: 7, aiScore: 77 },
      { name: '春天', building: '110栋', floor: '2F', room: 'B9', style: '110栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 9, stability: 8, delivery: 7, aiScore: 74 },
      { name: '红果果', building: '110栋', floor: '2F', room: 'A38', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 7, delivery: 9, aiScore: 72 },
      { name: '古屿', building: '110栋', floor: '2F', room: 'A43', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 8, stability: 9, delivery: 9, aiScore: 84 },
      { name: '高级时装', building: '110栋', floor: '', room: 'A-A056', style: '110栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 9, stability: 9, delivery: 7, aiScore: 73 },
      { name: '阳静', building: '110栋', floor: '2F', room: 'B17', style: '110栋宝藏', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 8, stability: 7, delivery: 7, aiScore: 74 },
      { name: 'PLUSTUDIO', building: '110栋', floor: '3F', room: 'A038', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 9, stability: 7, delivery: 8, aiScore: 81 },
      { name: '阿然', building: '110栋', floor: '2F', room: 'C5C', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 7, stability: 7, delivery: 7, aiScore: 72 },
      { name: '亿品', building: '110栋', floor: '5F', room: 'A058', style: '110栋宝藏', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 9, delivery: 8, aiScore: 88 },
    ],
    'niche': [ // 小众原创
      { name: 'Yan', building: '111栋', floor: '2F', room: 'A105', style: '高定感原创设计，重工工艺款居多，面料和剪裁都在线', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 10, stability: 8, delivery: 7, aiScore: 76 },
      { name: 'Kimss小野', building: '110栋', floor: '2F', room: 'A11', style: '韩系极简风天花板，版型对小个子超友好，温柔通勤党必冲', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 8, delivery: 7, aiScore: 86 },
      { name: 'Rich', building: '110栋', floor: '2F', room: 'A025', style: '面料控狂喜档口，自带高级光泽感，细节控一眼沦陷', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 10, stability: 7, delivery: 9, aiScore: 77 },
      { name: '笑脸', building: '110栋', floor: '2F', room: 'A25A', style: '鬼马少女风专属，小众又俏皮，春夏款的配色超绝', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 7, delivery: 8, aiScore: 75 },
      { name: '五號百货', building: '111栋', floor: '', room: 'D307A', style: '复古vintage风档口，配色和款式都超有年代感，复古控必逛', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 10, stability: 8, delivery: 7, aiScore: 80 },
      { name: '蝴蝶', building: '110栋', floor: '2F', room: 'B10', style: '暗黑甜酷风集合地，设计感拉满，甜酷女孩直接锁死', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 9, stability: 9, delivery: 7, aiScore: 78 },
      { name: '黑草', building: '111栋', floor: '2F', room: 'A065', style: '暗黑先锋风档口，设计超有辨识度，喜欢小众调性的别错过', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 8, delivery: 7, aiScore: 74 },
      { name: 'G-TWO', building: '111栋', floor: '2F', room: 'A108', style: '轻熟气质风yyds，版型显瘦不挑人，质感堪比专柜', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 8, stability: 9, delivery: 8, aiScore: 80 },
      { name: '发财', building: '贵航', floor: '', room: '669', style: '寓意超好的档口！版型宽松不挑身材，休闲款和辣妹款都有', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 7, stability: 8, delivery: 8, aiScore: 88 },
      { name: '公子九', building: '111栋', floor: '2F', room: 'A063', style: '新中式+极简风融合款，东方韵味拿捏得恰到好处', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 9, delivery: 7, aiScore: 74 },
      { name: 'Kingbaby', building: '贵航', floor: '', room: '8', style: '甜酷辣妹风专属，小众又吸睛，穿出去完全不用担心撞款', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 9, stability: 9, delivery: 7, aiScore: 85 },
      { name: 'G＋', building: '111栋', floor: '2F', room: 'A086', style: '韩系慵懒风天花板，面料软糯亲肤，松弛感穿搭必备', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 9, stability: 8, delivery: 9, aiScore: 86 },
      { name: '77', building: '110栋', floor: '2F', room: 'A458', style: '极简通勤风宝藏，基础款也能穿出高级感，上班族闭眼入', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 9, stability: 7, delivery: 9, aiScore: 88 },
      { name: '锦荣', building: '111栋', floor: '2F', room: 'A2', style: '小众轻奢风档口，重工刺绣和印花款超吸睛，细节感拉满', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 10, stability: 9, delivery: 7, aiScore: 94 },
      { name: 'YS', building: '111栋', floor: '2F', room: 'A120', style: '清冷高级感路线，黑白灰为主，职场和日常都能hold住', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 8, stability: 7, delivery: 7, aiScore: 96 },
      { name: 'W.', building: '111栋', floor: '2F', room: 'A113', style: '极简设计感档口，小众剪裁超有记忆点，不撞衫的秘密武器', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 7, delivery: 9, aiScore: 79 },
      { name: '八喜', building: '贵航B809', floor: '', room: '贵航B809', style: '韩系甜美风宝藏，软妹风款式超多，面料软糯又舒服', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 10, stability: 7, delivery: 8, aiScore: 86 },
      { name: 'Cyc', building: '111栋', floor: '3F', room: 'A308', style: '小众设计感集合地，原创印花和独特版型，自带辨识度buff', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 8, stability: 7, delivery: 7, aiScore: 96 },
    ],
    'guihang': [ // 贵航
      { name: '招财猫', building: '贵航A887', floor: '', room: '贵航A887', style: '贵航宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 9, delivery: 9, aiScore: 84 },
      { name: 'happy', building: '贵航', floor: '', room: '530', style: '贵航宝藏', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 9, stability: 8, delivery: 8, aiScore: 84 },
      { name: '八喜', building: '贵航', floor: '', room: '236', style: '贵航宝藏', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 10, stability: 7, delivery: 8, aiScore: 91 },
      { name: '集集', building: '贵航', floor: '', room: '3', style: '贵航宝藏', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 9, stability: 7, delivery: 8, aiScore: 85 },
      { name: 'Cici', building: '贵航', floor: '', room: '499', style: '贵航宝藏', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 8, stability: 9, delivery: 9, aiScore: 84 },
      { name: '大千金', building: '贵航', floor: '', room: '218', style: '贵航宝藏', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 7, stability: 9, delivery: 7, aiScore: 73 },
      { name: '大V家', building: '贵航', floor: '', room: '2', style: '贵航宝藏', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 10, stability: 9, delivery: 7, aiScore: 92 },
      { name: 'D.two', building: '贵航', floor: '', room: '617', style: '贵航宝藏', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 8, stability: 7, delivery: 9, aiScore: 73 },
      { name: '发财', building: '贵航', floor: '', room: '669', style: '贵航宝藏', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 7, stability: 8, delivery: 9, aiScore: 78 },
      { name: '大番茄', building: '贵航A888', floor: '', room: '贵航A888', style: '贵航宝藏', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 7, stability: 9, delivery: 7, aiScore: 83 },
      { name: 'Kingbaby', building: '贵航', floor: '', room: '8', style: '贵航宝藏', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 8, delivery: 7, aiScore: 83 },
      { name: '小新', building: '贵航', floor: '', room: '221', style: '贵航宝藏', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 9, delivery: 9, aiScore: 94 },
      { name: '東東家', building: '贵航', floor: '', room: '4', style: '贵航宝藏', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 8, delivery: 7, aiScore: 73 },
      { name: 'BALANCE', building: '贵航A719', floor: '', room: '贵航A719', style: '贵航宝藏', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 8, delivery: 9, aiScore: 73 },
      { name: '旺旺', building: '贵航A858', floor: '', room: '贵航A858', style: '贵航宝藏', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 7, stability: 8, delivery: 9, aiScore: 92 },
      { name: 'in嘉', building: '贵航B701', floor: '', room: '贵航B701', style: '贵航宝藏', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 8, stability: 9, delivery: 7, aiScore: 81 },
      { name: '吉牛牛', building: '贵航B706B', floor: '', room: '贵航B706B', style: '贵航宝藏', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 9, stability: 7, delivery: 9, aiScore: 90 },
      { name: '菜瓜家', building: '贵航', floor: '', room: '523', style: '贵航宝藏', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 7, delivery: 8, aiScore: 79 },
    ],
    'shangdao': [ // 尚道
      { name: 'YOUXU右续', building: '尚道-3-319', floor: '', room: '尚道-3-319', style: '轻奢通勤风，质感西装和连衣裙闭眼入', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 10, stability: 7, delivery: 7, aiScore: 83 },
      { name: 'SU SHUO素说', building: '尚道', floor: '', room: '318', style: '极简松弛感，韩系氛围感穿搭天花板', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 8, delivery: 7, aiScore: 73 },
      { name: '繁花', building: '尚道-2-236', floor: '', room: '尚道-2-236', style: '温柔气质挂，很适合做熟客回头款', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 8, delivery: 7, aiScore: 78 },
      { name: '川着', building: '尚道-3-321', floor: '', room: '尚道-3-321', style: '国风新中式，设计感独特不容易撞款', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 10, stability: 7, delivery: 7, aiScore: 72 },
      { name: '无纹', building: '尚道', floor: '', room: '333A', style: '简约高级，基础款也能穿出大牌感', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 8, delivery: 9, aiScore: 74 },
      { name: 'Segovia塞格维亚', building: '尚道', floor: '', room: '616', style: '法式复古，版型显瘦超绝', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 7, delivery: 8, aiScore: 77 },
      { name: 'Man漫', building: '尚道-2-252', floor: '', room: '尚道-2-252', style: '慵懒韩系，氛围感拿捏到位', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 7, delivery: 8, aiScore: 86 },
      { name: 'VINN雯恩', building: '尚道', floor: '', room: '718A', style: '精致女人味，轻熟风主打', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 7, stability: 8, delivery: 7, aiScore: 84 },
      { name: '蔻衣', building: '尚道', floor: '', room: '519', style: '通勤刚需款，实体店爆款很多出自这家', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 8, stability: 9, delivery: 7, aiScore: 89 },
      { name: '非空', building: '尚道', floor: '', room: '702', style: '小众设计师风，辨识度很高', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 8, stability: 7, delivery: 7, aiScore: 78 },
      { name: '蒙绒', building: '尚道', floor: '', room: '502', style: '秋冬质感封神，羊绒类做得很专业', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 8, stability: 8, delivery: 9, aiScore: 85 },
      { name: 'IN GROW IN', building: '尚道', floor: '', room: '408', style: '甜酷少女感，年轻款选它', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 8, stability: 8, delivery: 9, aiScore: 95 },
      { name: '赛若莉亚', building: '尚道', floor: '', room: '418', style: '优雅名媛风，宴会、日常都适配', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 9, stability: 8, delivery: 8, aiScore: 80 },
      { name: '大官人', building: '尚道', floor: '', room: '513', style: '大女主气场，飒爽御姐风', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 9, stability: 9, delivery: 7, aiScore: 80 },
      { name: 'Metodo込目', building: '尚道', floor: '', room: '710', style: '极简暗黑系，酷飒高级', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 7, delivery: 9, aiScore: 91 },
      { name: '心藏', building: '尚道', floor: '', room: '511A', style: '温柔新中式，国风爱好者必冲', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 9, stability: 7, delivery: 8, aiScore: 89 },
      { name: '小花家', building: '尚道', floor: '', room: '611B', style: '韩系温柔，小个子也友好', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 7, stability: 8, delivery: 8, aiScore: 85 },
      { name: '暮云谷', building: '尚道-2-256', floor: '', room: '尚道-2-256', style: '复古文艺，氛围感拉满', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 7, delivery: 9, aiScore: 77 },
    ],
    'jinhui': [ // 金晖大厦
      { name: '盛唐未央', building: '金晖大厦', floor: '1F', room: 'B1035', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 9, delivery: 9, aiScore: 91 },
      { name: '张家', building: '金晖大厦', floor: '1F', room: 'A1032B', style: '金晖一楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 7, stability: 8, delivery: 9, aiScore: 96 },
      { name: '2U', building: '金晖大厦', floor: '1F', room: 'B1016', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 7, delivery: 9, aiScore: 83 },
      { name: 'WD&GRACE', building: '金晖大厦', floor: '1F', room: 'A1003', style: '金晖一楼', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 7, stability: 7, delivery: 9, aiScore: 85 },
      { name: '林冬', building: '金晖大厦', floor: '1F', room: 'B1003', style: '金晖一楼', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 9, stability: 8, delivery: 9, aiScore: 74 },
      { name: '或许', building: '金晖大厦', floor: '1F', room: 'B1025', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 7, stability: 7, delivery: 7, aiScore: 93 },
      { name: '子立', building: '金晖大厦', floor: '1F', room: 'B1021', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 9, stability: 7, delivery: 8, aiScore: 73 },
      { name: 'oni妮', building: '金晖大厦', floor: '1F', room: 'A1019', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 8, delivery: 7, aiScore: 82 },
      { name: '以洵', building: '金晖大厦', floor: '1F', room: 'A1006', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 8, stability: 7, delivery: 8, aiScore: 95 },
      { name: '晨风', building: '金晖大厦', floor: '1F', room: 'A1027', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 9, stability: 8, delivery: 7, aiScore: 72 },
      { name: '三十·路', building: '金晖大厦', floor: '1F', room: 'A1025', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 8, stability: 9, delivery: 7, aiScore: 93 },
      { name: 'WANG SHOWROOM', building: '金晖大厦', floor: '1F', room: 'A1002', style: '金晖一楼', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 8, delivery: 9, aiScore: 86 },
      { name: 'MUMI TARA', building: '金晖大厦', floor: '1F', room: 'A1037', style: '金晖一楼', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 7, delivery: 8, aiScore: 75 },
      { name: '边张', building: '金晖大厦', floor: '1F', room: 'A1010', style: '金晖一楼', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 9, stability: 9, delivery: 9, aiScore: 82 },
      { name: '言梭', building: '金晖大厦', floor: '1F', room: 'A1012', style: '金晖一楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 7, delivery: 8, aiScore: 80 },
      { name: 'DOWNSTAIRS楼下', building: '金晖大厦', floor: '1F', room: 'A1024', style: '金晖一楼', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 8, stability: 7, delivery: 9, aiScore: 90 },
      { name: '三裁缝', building: '金晖大厦', floor: '1F', room: 'A1035', style: '金晖一楼', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 9, delivery: 7, aiScore: 84 },
      { name: 'ZiLishowroom', building: '金晖大厦', floor: '1F', room: 'B1021', style: '金晖一楼', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 10, stability: 9, delivery: 7, aiScore: 84 },
      { name: '锦荣', building: '金晖大厦', floor: '2F', room: 'A2002', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 10, stability: 7, delivery: 9, aiScore: 85 },
      { name: '上善', building: '金晖大厦', floor: '2F', room: 'A2020', style: '金晖二楼', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 7, stability: 9, delivery: 7, aiScore: 92 },
      { name: '右续', building: '金晖大厦', floor: '2F', room: 'A2088', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 7, delivery: 8, aiScore: 85 },
      { name: '色子', building: '金晖大厦', floor: '2F', room: 'B2013', style: '金晖二楼', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 8, stability: 7, delivery: 8, aiScore: 90 },
      { name: '欧瑞丝', building: '金晖大厦', floor: '2F', room: 'B2031', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 9, stability: 9, delivery: 7, aiScore: 85 },
      { name: '慧家', building: '金晖大厦', floor: '2F', room: 'A2010', style: '金晖二楼', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 10, stability: 9, delivery: 8, aiScore: 96 },
      { name: 'FENGGY', building: '金晖大厦', floor: '2F', room: 'B2020', style: '金晖二楼', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 9, delivery: 8, aiScore: 95 },
      { name: '一琢', building: '金晖大厦', floor: '2F', room: 'B2000', style: '金晖二楼', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 8, delivery: 9, aiScore: 88 },
      { name: 'e1', building: '金晖大厦', floor: '2F', room: 'B2032', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 9, stability: 8, delivery: 8, aiScore: 77 },
      { name: '主章', building: '金晖大厦', floor: '2F', room: 'A2068', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 7, fabric: 7, stability: 9, delivery: 7, aiScore: 83 },
      { name: '秀家', building: '金晖大厦', floor: '2F', room: 'A2008', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 8, stability: 9, delivery: 9, aiScore: 92 },
      { name: '伊文蔡', building: '金晖大厦', floor: '2F', room: 'B2026', style: '金晖二楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 7, stability: 9, delivery: 8, aiScore: 83 },
      { name: '如木苏', building: '金晖大厦', floor: '2F', room: 'A2008-2', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 9, stability: 8, delivery: 8, aiScore: 82 },
      { name: 'ESTELLA.HH', building: '金晖大厦', floor: '2F', room: 'B2023', style: '金晖二楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 9, stability: 9, delivery: 7, aiScore: 88 },
      { name: '装苑', building: '金晖大厦', floor: '2F', room: 'B2017', style: '金晖二楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 8, stability: 8, delivery: 9, aiScore: 74 },
      { name: '万紫千红', building: '金晖大厦', floor: '2F', room: 'A20266', style: '金晖二楼', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 7, stability: 8, delivery: 7, aiScore: 72 },
      { name: 'ZOU PING', building: '金晖大厦', floor: '2F', room: 'B2028', style: '金晖二楼', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 7, stability: 9, delivery: 8, aiScore: 73 },
      { name: '未弗未', building: '金晖大厦', floor: '2F', room: '2047', style: '金晖二楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 8, stability: 8, delivery: 8, aiScore: 74 },
      { name: 'ZI CHEN紫辰', building: '金晖大厦', floor: '3F', room: '3002', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 9, stability: 9, delivery: 7, aiScore: 77 },
      { name: '叁子', building: '金晖大厦', floor: '3F', room: '3050', style: '金晖三楼', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 7, stability: 8, delivery: 7, aiScore: 85 },
      { name: 'CHUN纯', building: '金晖大厦', floor: '3F', room: '3011', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 9, delivery: 8, aiScore: 92 },
      { name: 'YWMUM言午木木', building: '金晖大厦', floor: '3F', room: '3001', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 7, delivery: 7, aiScore: 83 },
      { name: '込目', building: '金晖大厦', floor: '3F', room: '3006', style: '金晖三楼', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 7, stability: 9, delivery: 8, aiScore: 72 },
      { name: 'LE乐熙儿', building: '金晖大厦', floor: '3F', room: '3002', style: '金晖三楼', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 7, stability: 8, delivery: 7, aiScore: 78 },
      { name: '麦社', building: '金晖大厦', floor: '3F', room: '3039', style: '金晖三楼', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 8, stability: 9, delivery: 8, aiScore: 89 },
      { name: '蔻牌', building: '金晖大厦', floor: '3F', room: '3058', style: '金晖三楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 7, stability: 9, delivery: 8, aiScore: 72 },
      { name: '多摹', building: '金晖大厦', floor: '3F', room: '3021', style: '金晖三楼', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 7, stability: 7, delivery: 8, aiScore: 93 },
      { name: '拙茧', building: '金晖大厦', floor: '3F', room: '3036', style: '金晖三楼', desc: '', hotItems: '', originality: 10, riskResist: 9, fabric: 8, stability: 8, delivery: 7, aiScore: 86 },
      { name: '知前', building: '金晖大厦', floor: '3F', room: '3038', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 7, fabric: 10, stability: 9, delivery: 8, aiScore: 91 },
      { name: 'MISS WONG', building: '金晖大厦', floor: '3F', room: '3043', style: '金晖三楼', desc: '', hotItems: '', originality: 9, riskResist: 8, fabric: 9, stability: 9, delivery: 7, aiScore: 92 },
      { name: 'NOO泥朵', building: '金晖大厦', floor: '3F', room: '3015', style: '金晖三楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 10, stability: 9, delivery: 8, aiScore: 96 },
      { name: '一着', building: '金晖大厦', floor: '3F', room: '3041', style: '金晖三楼', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 7, stability: 9, delivery: 9, aiScore: 93 },
      { name: '芮蔻', building: '金晖大厦', floor: '3F', room: '3027', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 9, fabric: 10, stability: 8, delivery: 7, aiScore: 92 },
      { name: '其用', building: '金晖大厦', floor: '3F', room: '3010', style: '金晖三楼', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 8, delivery: 9, aiScore: 88 },
      { name: '弥汐', building: '金晖大厦', floor: '3F', room: '3029', style: '金晖三楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 10, stability: 7, delivery: 8, aiScore: 77 },
      { name: '一模千样', building: '金晖大厦', floor: '4F', room: '8801', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 8, stability: 8, delivery: 9, aiScore: 75 },
      { name: '衣咖', building: '金晖大厦', floor: '4F', room: '8823', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 7, fabric: 7, stability: 9, delivery: 7, aiScore: 75 },
      { name: '梅森', building: '金晖大厦', floor: '4F', room: '8815', style: '金晖四楼', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 9, stability: 7, delivery: 7, aiScore: 79 },
      { name: '一禾', building: '金晖大厦', floor: '4F', room: '8828', style: '金晖四楼', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 7, stability: 8, delivery: 8, aiScore: 92 },
      { name: 'O范', building: '金晖大厦', floor: '4F', room: '8822', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 6, fabric: 9, stability: 9, delivery: 7, aiScore: 80 },
      { name: 'Dress queen', building: '金晖大厦', floor: '4F', room: '8805', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 7, stability: 9, delivery: 7, aiScore: 72 },
      { name: '西太后', building: '金晖大厦', floor: '4F', room: '8807', style: '金晖四楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 9, delivery: 7, aiScore: 74 },
      { name: '制在', building: '金晖大厦', floor: '4F', room: '8813', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 8, fabric: 10, stability: 8, delivery: 7, aiScore: 88 },
      { name: '和家', building: '金晖大厦', floor: '4F', room: '8803', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 7, stability: 9, delivery: 9, aiScore: 84 },
      { name: '麦沙', building: '金晖大厦', floor: '4F', room: '8808', style: '金晖四楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 7, stability: 8, delivery: 7, aiScore: 81 },
      { name: '悠路铭衫', building: '金晖大厦', floor: '4F', room: '8817', style: '金晖四楼', desc: '', hotItems: '', originality: 8, riskResist: 6, fabric: 10, stability: 9, delivery: 7, aiScore: 73 },
      { name: 'PANTTERFLY', building: '金晖大厦', floor: '4F', room: '8802', style: '金晖四楼', desc: '', hotItems: '', originality: 10, riskResist: 8, fabric: 10, stability: 7, delivery: 9, aiScore: 82 },
      { name: '比序', building: '金晖大厦', floor: '4F', room: '8809A', style: '金晖四楼', desc: '', hotItems: '', originality: 7, riskResist: 9, fabric: 10, stability: 9, delivery: 7, aiScore: 83 },
      { name: 'Maartje', building: '金晖大厦', floor: '4F', room: '8816', style: '金晖四楼', desc: '', hotItems: '', originality: 8, riskResist: 8, fabric: 7, stability: 9, delivery: 7, aiScore: 84 },
      { name: '麒安', building: '金晖大厦', floor: '4F', room: '8827', style: '金晖四楼', desc: '', hotItems: '', originality: 9, riskResist: 6, fabric: 10, stability: 8, delivery: 9, aiScore: 80 },
      { name: '觅采', building: '金晖大厦', floor: '4F', room: '8816A', style: '金晖四楼', desc: '', hotItems: '', originality: 10, riskResist: 6, fabric: 10, stability: 9, delivery: 8, aiScore: 86 },
      { name: 'NN', building: '金晖大厦', floor: '4F', room: '8832', style: '金晖四楼', desc: '', hotItems: '', originality: 9, riskResist: 9, fabric: 9, stability: 9, delivery: 7, aiScore: 82 },
      { name: '婉派', building: '金晖大厦', floor: '4F', room: '8811', style: '金晖四楼', desc: '', hotItems: '', originality: 9, riskResist: 7, fabric: 7, stability: 9, delivery: 7, aiScore: 94 },
    ],
  };

  // Flatten all shops for search
  const allShops = [];
  for (const [cat, list] of Object.entries(shopData)) { list.forEach(s => allShops.push({ ...s, category: cat })); }

  // Sort by aiScore descending for "综合" filter
  const topShops = [...allShops].sort((a, b) => b.aiScore - a.aiScore);

  const storeData = [
    { city: '北京', name: '京奢名店', area: '320㎡', price: '¥3000-8000', style: '高奢/老钱风', age: '35-50岁', years: '8年', freq: '每周3次', amount: '¥12万/月', growth: '+5%', desc: '北京朝阳区顶级高奢门店。' },
    { city: '上海', name: '静奢生活馆', area: '280㎡', price: '¥2000-5000', style: '静奢/老钱风', age: '30-45岁', years: '5年', freq: '每周2次', amount: '¥8万/月', growth: '+15%', desc: '上海静安区高端女装门店。' },
    { city: '成都', name: '蜀雅衣舍', area: '150㎡', price: '¥800-2000', style: '新中式/轻奢', age: '25-38岁', years: '3年', freq: '每周1次', amount: '¥3万/月', growth: '+22%', desc: '成都高新区新中式风格门店。' },
    { city: '杭州', name: '雅韵衣坊', area: '200㎡', price: '¥1500-3500', style: '极简/通勤', age: '28-42岁', years: '4年', freq: '每两周1次', amount: '¥5万/月', growth: '+8%', desc: '杭州西湖区极简通勤风格门店。' },
    { city: '广州', name: '南风雅舍', area: '180㎡', price: '¥600-1500', style: '韩系/通勤', age: '25-35岁', years: '2年', freq: '每周1次', amount: '¥2万/月', growth: '+12%', desc: '广州天河区韩系通勤风格门店。' },
  ];

  const contentTemplates = {
    wechat: { title: '公众号文章', icon: '📝', text: '《老钱风热度持续走高，南油档口出货稳定——NY INDEX 周报》\n\n本周南油趋势指数达到92.6分，老钱风热度持续上涨……\n\n核心数据：\n• 老钱风指数 92分，增长+3.2\n• 驼色系需求上涨15%\n• 羊绒大衣出货量增长20%' },
    video: { title: '短视频脚本', icon: '🎬', text: '【开场】"这周南油什么风最火？——老钱风指数92分！"\n【展示】驼色大衣穿搭 3s\n【数据】趋势指数走势图 2s\n【推荐】渡己档口推荐 2s\n【结尾】"关注NY INDEX，每周趋势不迷路"' },
    live: { title: '直播话术', icon: '🎤', text: '开场："姐妹们！今天南油最新趋势——老钱风！"\n数据展示："看这个指数，92分！驼色大衣这周出货量增长了20%！"\n单品推荐："渡己的醋酸衬衫，手感绝了！"\n促单："今天直播间专属价，限量20件！"' },
    moments: { title: '朋友圈', icon: '💬', text: '📊 NY INDEX 周报\n老钱风指数 92↑ 静奢风指数 88↑\n新中式增长+18.3%\n本周推荐：驼色羊绒大衣 | 渡己 107栋-1F-F07\n扫码查看完整报告 →' },
    redbook: { title: '小红书', icon: '📕', text: '姐妹们！南油最新趋势来了🔥\n老钱风指数92分，驼色大衣绝绝子！\n#南油趋势 #老钱风 #高端女装 #NY INDEX\n推荐档口：渡己 107栋1F-F07\n原创简约高端女装天花板！' },
    weibo: { title: '微博', icon: '📢', text: '#南油趋势指数# 本周老钱风热度持续上涨，指数达92分！驼色系+羊绒材质是核心关键词。关注@NY_INDEX 获取完整周报 📊' },
    videochannel: { title: '视频号', icon: '📺', text: '本周南油趋势速报：\n老钱风 92分↑ | 静奢风 88分↑ | 新中式+18.3%\n推荐单品：驼色羊绒大衣\n推荐档口：渡己 107栋1F-F07\n完整报告见NY INDEX' },
    report: { title: '周报', icon: '📊', text: 'NY INDEX 周报 | 2026年第30周\n━━━━━━━━━━━━━\n📊 综合指数: 92.6 ↑3.2\n🔥 热门趋势: 老钱风92分 | 静奢风88分\n🆕 新增趋势: 5个\n📈 增长最快: 新中式+18.3%\n━━━━━━━━━━━━━\n📌 核心建议:\n1. 优先备货驼色/燕麦色系\n2. 关注渡己档口醋酸衬衫\n3. 新中式试单控制风险\n━━━━━━━━━━━━━' },
  };

  // ===== Click Handlers =====

  // Trend items on home
  bindClick('.trend-item', (el) => {
    const name = el.querySelector('.trend-name')?.textContent;
    const trend = trendData.styles.find(t => t.name === name);
    if (trend) openTrendDetail(trend);
  });

  bindClick('.rank-item[data-type="trend"]', (el) => {
    const name = el.querySelector('.rank-name')?.textContent;
    const cat = currentTrendCategory || 'styles';
    const trend = trendData[cat]?.find(t => t.name === name) || trendData.styles.find(t => t.name === name);
    if (trend) openTrendDetail(trend);
  });

  function openTrendDetail(t) {
    const stars = '★'.repeat(t.recommend) + '☆'.repeat(10 - t.recommend);
    const riskStars = '★'.repeat(t.risk) + '☆'.repeat(10 - t.risk);
    openModal(t.name + ' — 趋势详情', `<div class="dm"><div class="dm-scores"><div class="dm-score"><span class="dm-label">热度指数</span><span class="dm-big">${t.score}</span></div><div class="dm-score"><span class="dm-label">增长</span><span class="dm-big ${t.growth.startsWith('+') ? 'g' : 'c'}">${t.growth}</span></div><div class="dm-score"><span class="dm-label">生命周期</span><span class="dm-big">${t.lifecycle}</span></div></div><div class="dm-section"><div class="dm-row"><span class="dm-key">推荐指数</span><span class="dm-val">${stars}</span></div><div class="dm-row"><span class="dm-key">风险指数</span><span class="dm-val">${riskStars}</span></div><div class="dm-row"><span class="dm-key">关联标签</span><span class="dm-val">${t.tags.join(' · ')}</span></div></div><div class="dm-section"><span class="dm-title">趋势解读</span><p class="dm-text">${t.desc}</p></div></div>`);
  }

  // Brand clicks
  bindClick('.rank-item[data-type="brand"]', (el) => {
    const name = el.querySelector('.rank-name')?.textContent?.trim();
    const filter = currentBrandFilter || 'hot';
    const brand = brandData[filter]?.find(b => b.name === name) || findBrand(name);
    if (brand) openBrandDetail(brand);
  });
  bindClick('.rec-grid-card[data-type="brand"]', (el) => {
    const name = el.querySelector('.rec-grid-name')?.textContent?.trim();
    const brand = findBrand(name);
    if (brand) openBrandDetail(brand);
  });

  function findBrand(name) {
    for (const cat of Object.values(brandData)) { const b = cat.find(x => x.name === name); if (b) return b; }
    return null;
  }

  function openBrandDetail(b) {
    openModal(b.name + ' — 品牌详情', `<div class="dm"><div class="dm-brand-header"><div class="dm-brand-logo ${b.color}">${b.logo}</div><div class="dm-brand-info"><span class="dm-brand-name">${b.name}</span><span class="dm-brand-tag">${b.tag}</span><span class="dm-brand-score">评分 ${b.score}</span></div></div><div class="dm-section"><span class="dm-title">品牌故事</span><p class="dm-text">${b.story}</p></div><div class="dm-section"><div class="dm-row"><span class="dm-key">品牌DNA</span><span class="dm-val">${b.dna}</span></div><div class="dm-row"><span class="dm-key">代表颜色</span><span class="dm-val">${b.colors}</span></div><div class="dm-row"><span class="dm-key">代表面料</span><span class="dm-val">${b.fabrics}</span></div><div class="dm-row"><span class="dm-key">核心风格</span><span class="dm-val">${b.styles}</span></div><div class="dm-row"><span class="dm-key">热门单品</span><span class="dm-val">${b.hotItems}</span></div><div class="dm-row"><span class="dm-key">趋势</span><span class="dm-val gl">${b.trend}</span></div><div class="dm-row"><span class="dm-key">匹配度</span><span class="dm-val gn">${b.match}</span></div></div></div>`);
  }

  // Shop clicks
  bindClick('.rank-item[data-type="shop"]', (el) => {
    const name = el.querySelector('.rank-name')?.textContent?.trim() || '';
    const shop = allShops.find(s => s.name === name) || allShops.find(s => name.includes(s.name) || s.name.includes(name));
    if (shop) openShopDetail(shop);
  });
  bindClick('.rec-grid-card[data-type="shop"]', (el) => {
    const name = el.querySelector('.rec-grid-name')?.textContent?.trim() || '';
    const shop = allShops.find(s => s.name === name) || allShops.find(s => name.includes(s.name) || s.name.includes(name));
    if (shop) openShopDetail(shop);
  });

  function openShopDetail(s) {
    const coopRating = s.aiScore >= 90 ? '⭐⭐⭐⭐⭐' : s.aiScore >= 80 ? '⭐⭐⭐⭐' : s.aiScore >= 75 ? '⭐⭐⭐' : '⭐⭐';
    openModal(s.name + ' — 档口详情', `<div class="dm"><div class="dm-section"><div class="dm-row"><span class="dm-key">位置</span><span class="dm-val">${s.building} ${s.floor}-${s.room}</span></div><div class="dm-row"><span class="dm-key">风格</span><span class="dm-val gl">${s.style}</span></div>${s.hotItems ? `<div class="dm-row"><span class="dm-key">热门单品</span><span class="dm-val">${s.hotItems}</span></div>` : ''}</div>${s.desc ? `<div class="dm-section"><span class="dm-title">档口介绍</span><p class="dm-text">${s.desc}</p></div>` : ''}<div class="dm-section"><span class="dm-title">能力评级</span><div class="dm-ratings"><div class="dm-rating"><span class="dm-rlabel">原创</span><div class="dm-rbar"><div class="dm-rfill" style="width:${s.originality*10}%;background:var(--accent-gold)"></div></div><span class="dm-rnum">${s.originality}/10</span></div><div class="dm-rating"><span class="dm-rlabel">抗风险</span><div class="dm-rbar"><div class="dm-rfill" style="width:${s.riskResist*10}%;background:var(--accent-green)"></div></div><span class="dm-rnum">${s.riskResist}/10</span></div><div class="dm-rating"><span class="dm-rlabel">面料</span><div class="dm-rbar"><div class="dm-rfill" style="width:${s.fabric*10}%;background:var(--accent-gold)"></div></div><span class="dm-rnum">${s.fabric}/10</span></div><div class="dm-rating"><span class="dm-rlabel">稳定</span><div class="dm-rbar"><div class="dm-rfill" style="width:${s.stability*10}%;background:var(--accent-green)"></div></div><span class="dm-rnum">${s.stability}/10</span></div><div class="dm-rating"><span class="dm-rlabel">交期</span><div class="dm-rbar"><div class="dm-rfill" style="width:${s.delivery*10}%;background:var(--accent-coral)"></div></div><span class="dm-rnum">${s.delivery}/10</span></div></div></div><div class="dm-section"><div class="dm-row"><span class="dm-key">AI评分</span><span class="dm-val gl">${s.aiScore}</span></div><div class="dm-row"><span class="dm-key">评价</span><span class="dm-val">${coopRating}</span></div></div><div class="dm-section"><span class="dm-title">档口产品图</span><div id="shop-products" class="shop-products"><div class="stall-empty">加载中...</div></div></div></div>`);
    loadShopProducts(s.name);
  }

  async function loadShopProducts(name) {
    const el = document.getElementById('shop-products');
    if (!el) return;
    try {
      const list = await apiJSON('/api/stalls/' + encodeURIComponent(name) + '/products');
      if (!list.length) { el.innerHTML = '<div class="stall-empty">该档口暂未上传产品图</div>'; return; }
      el.innerHTML = '<div class="shop-gallery">' + list.map(p => `<div class="shop-gallery-item"><img src="${p.url}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px"><div style="font-size:12px;color:#6B7288;margin-top:4px">${p.caption || ''}</div></div>`).join('') + '</div>';
    } catch (err) { el.innerHTML = '<div class="stall-empty">产品图需后端支持（运行 server 后可见）</div>'; }
  }

  // Store clicks
  bindClick('.rank-item[data-type="store"]', (el) => {
    const name = el.querySelector('.rank-name')?.textContent?.trim();
    const store = storeData.find(s => s.name === name);
    if (store) openStoreDetailModal(store);
  });
  function openStoreDetailModal(st) {
    openModal(st.city + ' · ' + st.name, `<div class="dm"><div class="dm-section"><div class="dm-row"><span class="dm-key">城市</span><span class="dm-val">${st.city}</span></div><div class="dm-row"><span class="dm-key">面积</span><span class="dm-val">${st.area}</span></div><div class="dm-row"><span class="dm-key">客单价</span><span class="dm-val gl">${st.price}</span></div><div class="dm-row"><span class="dm-key">风格</span><span class="dm-val gl">${st.style}</span></div><div class="dm-row"><span class="dm-key">客户年龄</span><span class="dm-val">${st.age}</span></div><div class="dm-row"><span class="dm-key">经营时间</span><span class="dm-val">${st.years}</span></div><div class="dm-row"><span class="dm-key">采购频率</span><span class="dm-val">${st.freq}</span></div><div class="dm-row"><span class="dm-key">月采购额</span><span class="dm-val">${st.amount}</span></div><div class="dm-row"><span class="dm-key">增长</span><span class="dm-val gn">${st.growth}</span></div></div><div class="dm-section"><span class="dm-title">门店描述</span><p class="dm-text">${st.desc}</p></div></div>`);
  }

  // Metric cards on home
  bindClick('.metric-card', (el) => {
    const label = el.querySelector('.metric-label')?.textContent;
    const value = el.querySelector('.metric-value')?.textContent;
    const extra = el.querySelector('.trend-badge, .metric-sub')?.textContent || '';
    let detail = '';
    if (label === '今日行业指数') {
      detail = `<div class="dm-section"><span class="dm-title">指数分解</span><div class="dm-row"><span class="dm-key">老钱风</span><span class="dm-val">92 ↑3.2</span></div><div class="dm-row"><span class="dm-key">静奢风</span><span class="dm-val">88 ↑2.8</span></div><div class="dm-row"><span class="dm-key">新中式</span><span class="dm-val">76 ↑18.3</span></div><div class="dm-row"><span class="dm-key">极简通勤</span><span class="dm-val">69 ↑1.5</span></div><div class="dm-row"><span class="dm-key">街头机能</span><span class="dm-val c">63 ↓2.1</span></div><div class="dm-row"><span class="dm-key">综合指数</span><span class="dm-val gl">92.6</span></div></div>`;
    } else if (label === '热门趋势数') {
      detail = `<div class="dm-section"><span class="dm-title">趋势分布</span><div class="dm-row"><span class="dm-key">风格趋势</span><span class="dm-val">+3</span></div><div class="dm-row"><span class="dm-key">颜色趋势</span><span class="dm-val">+1</span></div><div class="dm-row"><span class="dm-key">面料趋势</span><span class="dm-val">+1</span></div><div class="dm-row"><span class="dm-key">总计</span><span class="dm-val gl">37个活跃趋势</span></div></div>`;
    } else if (label === '增长最快风格') {
      detail = `<div class="dm-section"><span class="dm-title">新中式数据</span><div class="dm-row"><span class="dm-key">本周</span><span class="dm-val gn">+18.3%</span></div><div class="dm-row"><span class="dm-key">月度</span><span class="dm-val gn">+24.6%</span></div><div class="dm-row"><span class="dm-key">推荐</span><span class="dm-val">7/10</span></div><div class="dm-row"><span class="dm-key">风险</span><span class="dm-val c">5/10</span></div></div>`;
    } else if (label === '新增会员') {
      detail = `<div class="dm-section"><span class="dm-title">会员数据</span><div class="dm-row"><span class="dm-key">本月新增</span><span class="dm-val gn">+248</span></div><div class="dm-row"><span class="dm-key">活跃会员</span><span class="dm-val gl">1,268</span></div><div class="dm-row"><span class="dm-key">环比</span><span class="dm-val gn">+33%</span></div></div>`;
    }
    openModal(label, `<div class="dm"><div class="dm-hero">${value}<br><small>${extra}</small></div>${detail}</div>`);
  });

  // Vendor items on home (using real shop data)
  bindClick('.vendor-item', (el) => {
    const name = el.querySelector('.vendor-name')?.textContent?.trim() || '';
    const shop = allShops.find(s => name.includes(s.name) || s.name.includes(name.split(' ')[0]));
    if (shop) openShopDetail(shop);
  });

  // Category cards on home
  bindClick('.category-card', (el) => {
    const label = el.querySelector('.category-label')?.textContent;
    if (label === '热门品牌') showScreen('brand');
    else if (label === '热门颜色') { showScreen('trend'); setTimeout(() => document.querySelector('#screen-trend .category-tab[data-cat="colors"]')?.click(), 100); }
    else if (label === '热门面料') { showScreen('trend'); setTimeout(() => document.querySelector('#screen-trend .category-tab[data-cat="fabrics"]')?.click(), 100); }
  });

  // AI summary
  bindClick('.view-more', () => {
    openModal('AI 今日总结 — 完整分析', `<div class="dm"><div class="dm-section"><span class="dm-title">核心数据</span><div class="dm-row"><span class="dm-key">老钱风指数</span><span class="dm-val gl">92 ↑3.2</span></div><div class="dm-row"><span class="dm-key">静奢风指数</span><span class="dm-val">88 ↑2.8</span></div><div class="dm-row"><span class="dm-key">新中式增长</span><span class="dm-val gn">+18.3%</span></div><div class="dm-row"><span class="dm-key">驼色系需求</span><span class="dm-val gl">↑15%</span></div></div><div class="dm-section"><span class="dm-title">AI建议</span><p class="dm-text">① 优先备货驼色/燕麦色系羊毛羊绒单品</p><p class="dm-text">② 关注渡己档口（107栋1F-F07），原创简约高端天花板</p><p class="dm-text">③ 新中式可试单但需控制风险</p></div></div>`);
  });

  bindClick('.section-more', (el) => {
    const title = el.parentElement?.querySelector('.section-title')?.textContent;
    if (title?.includes('趋势')) showScreen('trend');
    else if (title?.includes('档口')) showScreen('shop');
    else if (title?.includes('品牌')) showScreen('brand');
  });

  bindClick('.fashion-insight-card', (el) => {
    const title = el.querySelector('.fashion-insight-header span')?.textContent;
    const text = el.querySelector('p')?.textContent;
    openModal(title + ' — 详细洞察', `<div class="dm"><div class="dm-section"><p class="dm-text">${text}</p></div></div>`);
  });

  bindClick('.icon-btn[aria-label="通知"]', () => {
    openModal('通知中心', `<div class="dm"><div class="dm-section"><div class="dm-notif"><span class="dm-nbadge gn">NEW</span><div><span class="dm-ntitle">老钱风热度上涨</span><span class="dm-ntext">指数从89升至92</span><span class="dm-ntime">2小时前</span></div></div><div class="dm-notif"><span class="dm-nbadge gl">AI</span><div><span class="dm-ntitle">AI周报已生成</span><span class="dm-ntext">本周趋势完整分析报告</span><span class="dm-ntime">6小时前</span></div></div></div></div>`);
  });

  bindClick('.avatar', () => {
    const user = loadUser() || {};
    const currentAvatar = user.avatarImg || '';
    const avatarLetter = user.avatarLetter || user.name?.charAt(0) || 'U';
    openModal('个人头像', `<div class="dm avatar-upload-modal">
      <div class="avatar-upload-preview" id="avatar-preview">${currentAvatar ? `<img src="${currentAvatar}" alt="头像">` : avatarLetter}</div>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">点击下方按钮上传或更换头像</p>
      <div class="avatar-upload-options">
        <button class="avatar-upload-btn avatar-upload-btn-primary" id="avatar-pick-btn">
          <svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px"><path d="M10 3v10M5 8h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
          选择图片上传
        </button>
        <button class="avatar-upload-btn avatar-upload-btn-secondary" id="avatar-camera-btn">
          <svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px"><path d="M3 7h3l2-2h4l2 2h3v10H3V7z" stroke="var(--text-primary)" stroke-width="1.5"/><circle cx="10" cy="12" r="3" stroke="var(--text-primary)" stroke-width="1.5"/></svg>
          拍照上传
        </button>
        ${currentAvatar ? `<button class="avatar-upload-btn avatar-upload-btn-danger" id="avatar-remove-btn">
          <svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px"><path d="M5 5l10 10M15 5L5 15" stroke="var(--accent-coral)" stroke-width="2" stroke-linecap="round"/></svg>
          移除头像
        </button>` : ''}
      </div>
      <input type="file" accept="image/*" id="avatar-hidden-input" style="display:none">
      <div style="margin-top:20px;padding:12px;background:var(--pastel-lavender-light);border-radius:12px;">
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.6">支持 JPG、PNG 格式，建议使用正方形图片。头像将显示在首页和个人中心。</p>
      </div>
    </div>`);
    setTimeout(() => {
      const hiddenInput = document.getElementById('avatar-hidden-input');
      const pickBtn = document.getElementById('avatar-pick-btn');
      const cameraBtn = document.getElementById('avatar-camera-btn');
      const removeBtn = document.getElementById('avatar-remove-btn');
      const preview = document.getElementById('avatar-preview');

      function triggerFile(capture) {
        if (!hiddenInput) return;
        if (capture) hiddenInput.setAttribute('capture', 'environment');
        else hiddenInput.removeAttribute('capture');
        hiddenInput.click();
      }

      if (pickBtn) pickBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerFile(false); });
      if (cameraBtn) cameraBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerFile(true); });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const u = loadUser() || {};
          delete u.avatarImg;
          saveUser(u);
          updateAvatarDisplay(u);
          closeModal();
        });
      }

      if (hiddenInput) {
        hiddenInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            // 压缩图片到合理尺寸
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const size = Math.min(img.width, img.height);
              const sx = (img.width - size) / 2;
              const sy = (img.height - size) / 2;
              canvas.width = 200;
              canvas.height = 200;
              ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              // 更新预览
              if (preview) preview.innerHTML = `<img src="${compressed}" alt="头像">`;
              // 保存
              const u = loadUser() || {};
              u.avatarImg = compressed;
              saveUser(u);
              updateAvatarDisplay(u);
              setTimeout(() => closeModal(), 600);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
    }, 100);
  });

  // ===== Tab / Filter Data Switching =====

  // Trend category tabs
  let currentTrendCategory = 'styles';
  document.querySelectorAll('#screen-trend .category-tab').forEach(tab => {
    tab.addEventListener('click', (e) => { e.stopPropagation(); const cat = tab.dataset.cat; if (!cat || !trendData[cat]) return; document.querySelectorAll('#screen-trend .category-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); currentTrendCategory = cat; updateTrendList(cat); });
  });
  function updateTrendList(cat) {
    const list = document.getElementById('trend-rank-list'); if (!list) return;
    const data = trendData[cat];
    list.innerHTML = data.map((item, idx) => `<div class="rank-item" data-type="trend" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><span class="rank-name">${item.name}</span></div><div class="rank-right"><span class="rank-score">${item.score}</span></div></div>`).join('');
    const chartTitle = document.getElementById('trend-chart-title'); if (chartTitle) chartTitle.textContent = data[0].name + '走势';
    const insightText = document.querySelector('#screen-trend .fashion-insight-card p'); if (insightText) insightText.textContent = data[0].desc;
    list.querySelectorAll('.rank-item[data-type="trend"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent; const trend = trendData[cat]?.find(t => t.name === name); if (trend) openTrendDetail(trend); }); });
  }

  // Brand filter tabs
  let currentBrandFilter = 'hot';
  document.querySelectorAll('#screen-brand .filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => { e.stopPropagation(); const filter = tab.dataset.filter; if (!filter || !brandData[filter]) return; document.querySelectorAll('#screen-brand .filter-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); currentBrandFilter = filter; const searchInput = document.getElementById('brand-search-input'); if (searchInput) searchInput.value = ''; updateBrandList(filter); });
  });
  function updateBrandList(filter, searchQuery) {
    const list = document.getElementById('brand-rank-list'); const grid = document.getElementById('brand-rec-grid');
    let data = brandData[filter]; if (!list || !data) return;
    if (searchQuery) { const q = searchQuery.toLowerCase(); data = data.filter(b => b.name.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q) || b.styles.toLowerCase().includes(q) || b.dna.toLowerCase().includes(q)); }
    list.innerHTML = data.slice(0, 5).map((item, idx) => `<div class="rank-item" data-type="brand" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><div class="rank-info"><span class="rank-name">${item.name}</span><span class="rank-tag">${item.tag}</span></div></div><span class="rank-score">${item.score}</span></div>`).join('');
    if (grid) { grid.innerHTML = data.slice(0, 4).map((item) => `<div class="rec-grid-card" data-type="brand" style="cursor:pointer"><div class="rec-grid-logo ${item.color || ''}">${item.logo}</div><span class="rec-grid-name">${item.name}</span><span class="rec-grid-tag">${item.tag.split(' · ').slice(0, 2).join(' · ')}</span></div>`).join(''); }
    if (data.length === 0) { list.innerHTML = '<div style="text-align:center;padding:24px;color:#6B7288;font-size:14px">未找到匹配的品牌</div>'; if (grid) grid.innerHTML = ''; }
    list.querySelectorAll('.rank-item[data-type="brand"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent?.trim(); const b = data.find(x => x.name === name); if (b) openBrandDetail(b); }); });
    if (grid) grid.querySelectorAll('.rec-grid-card[data-type="brand"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rec-grid-name')?.textContent?.trim(); const b = data.find(x => x.name === name); if (b) openBrandDetail(b); }); });
  }

  // Brand search
  const brandSearchInput = document.getElementById('brand-search-input');
  if (brandSearchInput) {
    brandSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query) { const q = query.toLowerCase(); const results = allBrands.filter(b => b.name.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q) || b.styles.toLowerCase().includes(q) || b.dna.toLowerCase().includes(q)); const list = document.getElementById('brand-rank-list'); const grid = document.getElementById('brand-rec-grid'); if (!list) return;
        list.innerHTML = results.slice(0, 5).map((item, idx) => `<div class="rank-item" data-type="brand" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><div class="rank-info"><span class="rank-name">${item.name}</span><span class="rank-tag">${item.tag}</span></div></div><span class="rank-score">${item.score}</span></div>`).join('');
        if (grid) { grid.innerHTML = results.slice(0, 4).map((item) => `<div class="rec-grid-card" data-type="brand" style="cursor:pointer"><div class="rec-grid-logo ${item.color || ''}">${item.logo}</div><span class="rec-grid-name">${item.name}</span><span class="rec-grid-tag">${item.tag.split(' · ').slice(0, 2).join(' · ')}</span></div>`).join(''); }
        if (results.length === 0) { list.innerHTML = '<div style="text-align:center;padding:24px;color:#6B7288;font-size:14px">未找到匹配的品牌</div>'; if (grid) grid.innerHTML = ''; }
        list.querySelectorAll('.rank-item[data-type="brand"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent?.trim(); const b = results.find(x => x.name === name); if (b) openBrandDetail(b); }); });
        if (grid) grid.querySelectorAll('.rec-grid-card[data-type="brand"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rec-grid-name')?.textContent?.trim(); const b = results.find(x => x.name === name); if (b) openBrandDetail(b); }); });
      } else { updateBrandList(currentBrandFilter); }
    });
  }

  // ===== Shop: Building-based filter tabs =====
  let currentShopFilter = 'all';
  document.querySelectorAll('#screen-shop .filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const filter = tab.dataset.filter;
      document.querySelectorAll('#screen-shop .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentShopFilter = filter;
      const searchInput = document.getElementById('shop-search-input'); if (searchInput) searchInput.value = '';
      updateShopList(filter);
    });
  });

  function updateShopList(filter, searchQuery) {
    const list = document.getElementById('shop-rank-list');
    const grid = document.getElementById('shop-rec-grid');
    if (!list) return;

    let data;
    if (filter === 'all') {
      data = topShops;
    } else if (shopData[filter]) {
      data = [...shopData[filter]].sort((a, b) => b.aiScore - a.aiScore);
    } else {
      data = topShops;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(q) || s.building.toLowerCase().includes(q) || s.floor.toLowerCase().includes(q) || s.room.toLowerCase().includes(q) || s.style.toLowerCase().includes(q) || (s.desc && s.desc.toLowerCase().includes(q)) || (s.hotItems && s.hotItems.toLowerCase().includes(q)));
    }

    list.innerHTML = data.slice(0, 10).map((item, idx) => `<div class="rank-item" data-type="shop" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><div class="rank-info"><span class="rank-name">${item.name}</span><span class="rank-tag">${item.building} ${item.floor}-${item.room} · ${item.style}</span></div></div><span class="rank-score">${item.aiScore}</span></div>`).join('');

    if (grid) {
      grid.innerHTML = data.slice(0, 4).map((item) => `<div class="rec-grid-card" data-type="shop" style="cursor:pointer"><div class="rec-grid-logo ${item.aiScore >= 85 ? 'gold' : item.aiScore >= 80 ? '' : 'coral'}">${item.name[0]}</div><span class="rec-grid-name">${item.name.length > 8 ? item.name.substring(0, 8) + '..' : item.name}</span><span class="rec-grid-tag">${item.building} ${item.floor} · ${item.style}</span></div>`).join('');
    }

    if (data.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:24px;color:#6B7288;font-size:14px">未找到匹配的档口</div>';
      if (grid) grid.innerHTML = '';
    }

    list.querySelectorAll('.rank-item[data-type="shop"]').forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent?.trim() || ''; const shop = data.find(s => s.name === name) || data.find(s => name.includes(s.name)); if (shop) openShopDetail(shop); });
    });
    if (grid) grid.querySelectorAll('.rec-grid-card[data-type="shop"]').forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rec-grid-name')?.textContent?.trim() || ''; const shop = data.find(s => s.name.startsWith(name) || name.startsWith(s.name)); if (shop) openShopDetail(shop); });
    });
  }

  // Shop search
  const shopSearchInput = document.getElementById('shop-search-input');
  if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query) {
        const q = query.toLowerCase();
        const results = allShops.filter(s => s.name.toLowerCase().includes(q) || s.building.toLowerCase().includes(q) || s.floor.toLowerCase().includes(q) || s.room.toLowerCase().includes(q) || s.style.toLowerCase().includes(q) || (s.desc && s.desc.toLowerCase().includes(q)) || (s.hotItems && s.hotItems.toLowerCase().includes(q)));
        const list = document.getElementById('shop-rank-list');
        const grid = document.getElementById('shop-rec-grid');
        if (!list) return;
        list.innerHTML = results.slice(0, 10).map((item, idx) => `<div class="rank-item" data-type="shop" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><div class="rank-info"><span class="rank-name">${item.name}</span><span class="rank-tag">${item.building} ${item.floor}-${item.room} · ${item.style}</span></div></div><span class="rank-score">${item.aiScore}</span></div>`).join('');
        if (grid) { grid.innerHTML = results.slice(0, 4).map((item) => `<div class="rec-grid-card" data-type="shop" style="cursor:pointer"><div class="rec-grid-logo ${item.aiScore >= 85 ? 'gold' : ''}">${item.name[0]}</div><span class="rec-grid-name">${item.name.length > 8 ? item.name.substring(0, 8) + '..' : item.name}</span><span class="rec-grid-tag">${item.building} ${item.floor} · ${item.style}</span></div>`).join(''); }
        if (results.length === 0) { list.innerHTML = '<div style="text-align:center;padding:24px;color:#6B7288;font-size:14px">未找到匹配的档口</div>'; if (grid) grid.innerHTML = ''; }
        list.querySelectorAll('.rank-item[data-type="shop"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent?.trim() || ''; const shop = results.find(s => s.name === name) || results.find(s => name.includes(s.name)); if (shop) openShopDetail(shop); }); });
        if (grid) grid.querySelectorAll('.rec-grid-card[data-type="shop"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rec-grid-name')?.textContent?.trim() || ''; const shop = results.find(s => s.name.startsWith(name) || name.startsWith(s.name)); if (shop) openShopDetail(shop); }); });
      } else { updateShopList(currentShopFilter); }
    });
  }

  // Store filter tabs
  document.querySelectorAll('#screen-stores .filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => { e.stopPropagation(); const filter = tab.dataset.filter; document.querySelectorAll('#screen-stores .filter-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); let sorted = [...storeData]; if (filter === 'growth') sorted.sort((a, b) => parseFloat(b.growth) - parseFloat(a.growth)); else if (filter === 'price') sorted.sort((a, b) => parseInt(b.price.replace(/[¥,]/g, '').split('-')[1]) - parseInt(a.price.replace(/[¥,]/g, '').split('-')[1])); else if (filter === 'area') sorted.sort((a, b) => parseInt(b.area) - parseInt(a.area)); updateStoreList(sorted); });
  });
  function updateStoreList(data) {
    const list = document.getElementById('store-list'); if (!list) return;
    list.innerHTML = data.map((st, idx) => `<div class="rank-item" data-type="store" style="cursor:pointer"><div class="rank-left"><span class="rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span><div class="rank-info"><span class="rank-name">${st.name}</span><span class="rank-tag">${st.city} · ${st.style} · ${st.price}</span></div></div><div class="rank-right"><span class="rank-score gn">${st.growth}</span></div></div>`).join('');
    list.querySelectorAll('.rank-item[data-type="store"]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const name = el.querySelector('.rank-name')?.textContent?.trim(); const st = storeData.find(s => s.name === name); if (st) openStoreDetailModal(st); }); });
  }

  // Content Center
  document.querySelectorAll('.content-gen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); const type = btn.dataset.type; const tmpl = contentTemplates[type]; if (!tmpl) return;
      openModal(tmpl.icon + ' ' + tmpl.title, `<div class="dm"><div class="dm-section"><span class="dm-title">已生成内容</span><div class="dm-preview"><pre class="dm-pre" data-type="${type}">${tmpl.text}</pre></div></div><div class="dm-actions"><button class="btn-primary btn-copy" data-type="${type}" style="cursor:pointer">复制内容</button><button class="btn-secondary btn-edit" style="cursor:pointer">编辑修改</button></div></div>`);
    });
  });

  // AI Input — 完整重写
  const aiInput = document.getElementById('ai-input-text');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiResponse = document.getElementById('ai-response-area');

  // AI 知识库 — 关键词匹配
  const aiKnowledge = [
    { keys: ['静奢','quiet luxury','极简','简约','性冷淡'], answer: '静奢风未来3-6个月仍具持续性。Loro Piana、The Row持续引领，南油107栋、110栋相关档口出货稳定。建议优先备货驼色、燕麦色系羊毛/羊绒单品，客单价800-2000元区间接受度最高。', brands: ['Loro Piana', 'The Row', 'Toteme'], shops: ['渡己 107栋1F-F07', '着印 110栋1F-F28', 'MM+ 108栋1F-B06'], score: 88, growth: '+12.4%', risk: '低' },
    { keys: ['老钱','old money','有钱','阔太','贵妇'], answer: '老钱风目前处于成熟期，热度指数92分，持续领跑。建议维持稳定备货，重点发力羊绒、真丝面料。嘉言专注羊绒十几年，是南油老钱风标杆档口。色彩以驼、灰、藏青为主。', brands: ['Loro Piana', 'Brunello Cucinelli', 'Ralph Lauren'], shops: ['嘉言 107栋1F-C11', '着印 110栋1F-F28', '渡己 107栋1F-F07'], score: 92, growth: '+8.2%', risk: '低' },
    { keys: ['新中式','国风','中式','东方','宋锦','盘扣'], answer: '新中式处于爆发期，增长+18.3%，但风险指数5/10需关注同质化。建议小批量试款，重点关注宋锦、香云纱面料。渡己和玫瑰人生是南油新中式代表档口。色彩推荐：墨绿、酒红、藏蓝。', brands: ['RUOHAN', 'UMAWANG', 'SAMUEL GUI YANG'], shops: ['渡己 107栋1F-F07', '玫瑰人生 107栋2F-D09', '曦晨 110栋2F-C7', '国朴 103栋1F-A29'], score: 76, growth: '+18.3%', risk: '中' },
    { keys: ['牛仔','denim','丹宁'], answer: '南油牛仔档口集中在107栋和110栋。TSYISHOW主打欧货快时尚牛仔，若轻是原创牛仔工厂，金兰惊蓝丹宁做全品类丹宁。建议关注高腰阔腿、微喇版型，浅色水洗持续走量。', brands: [], shops: ['TSYISHOW 107栋1F-A13', '若轻 108栋1F-C05', '金兰 110栋1F-F29'], score: 80, growth: '+6.1%', risk: '低' },
    { keys: ['香云纱','宋锦','锦缎','提花'], answer: '国风香云纱是南油特色品类，客单价高但客群精准。曦晨专做香云纱宋锦，国朴是宋锦天花板，云谷定制高端香云纱。建议搭配新中式版型，主攻40+高净值客群。', brands: [], shops: ['曦晨 110栋2F-C7', '国朴 103栋1F-A29', '云谷 103栋1F-A56'], score: 85, growth: '+15.7%', risk: '中' },
    { keys: ['羊绒','cashmere','羊毛','针织','毛衣'], answer: '羊绒品类是南油优势赛道，嘉言专注羊绒十几年是标杆。着印的羊绒大衣出货稳定。建议秋冬提前2个月备货，100%纯羊绒和羊绒混纺两条线并行。客单价1500-5000元。', brands: ['Loro Piana', 'Brunello Cucinelli'], shops: ['嘉言 107栋1F-C11', '着印 110栋1F-F28', '渡己 107栋1F-F07'], score: 90, growth: '+10.5%', risk: '低' },
    { keys: ['真丝','丝绸','silk','雪纺','飘逸'], answer: '真丝品类在南油107栋和金晖大厦有优质货源。建议关注19姆米以上重磅真丝，垂感和质感更佳。色彩推荐：香槟、雾蓝、豆绿。搭配静奢风版型效果最好。', brands: ['Toteme', 'Lemaire'], shops: ['渡己 107栋1F-F07', '玫瑰人生 107栋2F-D09'], score: 82, growth: '+7.3%', risk: '低' },
    { keys: ['备货','进货','拿货','采购','上货','补货'], answer: '当前备货建议：1）老钱风羊绒/大衣稳定备货30%；2）新中式小批量试款20%；3）牛仔基础款走量30%；4）留20%灵活补货空间。重点关注意大利面料档口和原创设计档口，降低同质化风险。', brands: [], shops: ['嘉言 107栋1F-C11', '渡己 107栋1F-F07', 'TSYISHOW 107栋1F-A13', 'MM+ 108栋1F-B06'], score: 85, growth: '-', risk: '中' },
    { keys: ['趋势','流行','热门','风口','方向','今年','2024','2025','2026'], answer: '当前南油四大趋势：①老钱风（92分，成熟期）②静奢风（88分，上升期）③新中式（76分，爆发期+18.3%）④国风香云纱（85分，细分增长）。建议老钱+静奢做基本盘，新中式+香云纱做增量盘。', brands: ['Loro Piana', 'The Row', 'RUOHAN'], shops: ['渡己 107栋1F-F07', '嘉言 107栋1F-C11', '玫瑰人生 107栋2F-D09'], score: 90, growth: '+12%', risk: '低' },
    { keys: ['颜色','色彩','配色','色系'], answer: '本季推荐色系：①驼色/燕麦色（老钱风核心，持续走量）②墨绿/酒红（新中式亮点）③雾蓝/香槟（静奢风进阶色）④浅灰/藏青（基础百搭）。建议每色系备2-3个SKU，根据动销调整。', brands: [], shops: ['渡己 107栋1F-F07', '嘉言 107栋1F-C11'], score: 80, growth: '+5%', risk: '低' },
    { keys: ['面料','材质','布料','质感'], answer: '南油优质面料推荐：①羊绒（嘉言，100%纯绒）②真丝（渡己，19姆米+）③香云纱（曦晨，手工晾晒）④意大利进口羊毛（着印）⑤亚麻混纺（夏季走量）。建议按客单价分层备货，高端用纯绒/真丝，中端用混纺。', brands: [], shops: ['嘉言 107栋1F-C11', '渡己 107栋1F-F07', '着印 110栋1F-F28', '曦晨 110栋2F-C7'], score: 85, growth: '+8%', risk: '低' },
    { keys: ['定价','价格','客单价','多少钱','利润','毛利'], answer: '南油档口定价参考：①羊绒大衣出厂价800-2000元，零售价2000-5000元，毛利50-60%②真丝连衣裙出厂价300-800元，零售价800-2000元③新中式上衣出厂价200-500元，零售价600-1500元。建议高端走品质溢价，中端走量。', brands: [], shops: ['嘉言 107栋1F-C11', '渡己 107栋1F-F07'], score: 78, growth: '-', risk: '中' },
    { keys: ['风险','赔钱','压货','库存','滞销'], answer: '当前风险提示：①新中式同质化风险（5/10），建议小批量试款②香云纱客群窄，备货不超过总量15%③牛仔竞争激烈，差异化是关键④避免全量押单一风格，建议4:3:2:1分散备货。留足现金流应对换季。', brands: [], shops: [], score: 70, growth: '-', risk: '高' },
    { keys: ['金晖','金晖大厦'], answer: '金晖大厦是南油高端女装核心商圈，以原创设计和品质面料著称。重点档口：1F精品区、2F设计师品牌区、3F羊绒大衣区。客单价普遍高于107/108栋，适合中高端实体店拿货。', brands: [], shops: ['渡己 107栋1F-F07', '嘉言 107栋1F-C11'], score: 85, growth: '+10%', risk: '低' },
    { keys: ['网红','直播','带货','爆款','引流'], answer: '网红爆款策略：①选款要有视觉记忆点（颜色/版型/细节）②直播款客单价控制300-800元③搭配短视频种草，重点拍面料特写和上身效果。南油适合直播的档口：TSYISHOW（牛仔快时尚）、MM+（原创设计）、妙婷家（新中式）。', brands: [], shops: ['TSYISHOW 107栋1F-A13', 'MM+ 108栋1F-B06', '妙婷家 107栋1F-E13A'], score: 82, growth: '+15%', risk: '中' },
  ];

  function aiMatch(query) {
    for (const item of aiKnowledge) {
      for (const key of item.keys) {
        if (query.toLowerCase().includes(key.toLowerCase())) return item;
      }
    }
    // 默认回答
    return { answer: '根据当前南油趋势数据分析：老钱风(92分)和静奢风(88分)持续领跑，新中式(+18.3%)处于爆发期。建议以老钱+静奢为基本盘，新中式+香云纱做增量。推荐档口：渡己（107栋1F-F07）原创简约高端天花板，嘉言（107栋1F-C11）专注羊绒。', brands: ['Loro Piana', 'The Row'], shops: ['渡己 107栋1F-F07', '嘉言 107栋1F-C11'], score: 90, growth: '+12%', risk: '低' };
  }

  function aiSend() {
    if (!aiInput || !aiInput.value.trim()) {
      // 输入为空时给视觉反馈
      if (aiInput) {
        aiInput.style.borderColor = '#F97316';
        aiInput.placeholder = '请输入您的问题...';
        setTimeout(() => { aiInput.style.borderColor = ''; aiInput.placeholder = '问趋势：今年静奢还能做吗？'; }, 2000);
      }
      return;
    }
    const q = aiInput.value.trim();
    aiInput.value = '';

    // 显示加载动画
    if (aiResponse) {
      aiResponse.innerHTML = `<div class="card response-card" style="border:1px solid var(--border-gold)"><div class="response-header"><svg class="response-icon" viewBox="0 0 18 18" fill="none" style="animation:spin 1s linear infinite"><circle cx="9" cy="9" r="7" stroke="#A78BFA" stroke-width="1.5" stroke-dasharray="22 22"/><path d="M9 5V9L12 11" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round"/></svg><span class="response-title">AI 正在分析中...</span></div></div>`;
    }

    // 模拟思考延迟后输出结果
    setTimeout(() => {
      const resp = aiMatch(q);
      if (!aiResponse) return;

      const brandsHtml = resp.brands.length > 0
        ? `<div class="card rec-card"><span class="rec-label">参考品牌</span><div class="brand-tags">${resp.brands.map(b => `<span class="brand-tag">${b}</span>`).join('')}</div></div>`
        : '';
      const shopsHtml = resp.shops.length > 0
        ? `<div class="card rec-card"><span class="rec-label">推荐档口</span>${resp.shops.map(s => `<div class="vendor-rec-item"><span class="vendor-rec-name">${s}</span><span class="vendor-rec-score">AI推荐</span></div>`).join('')}</div>`
        : '';

      aiResponse.innerHTML = `
        <div class="card" style="padding:10px 14px;margin-bottom:12px;background:rgba(167,139,250,0.08);border-radius:10px;border-left:3px solid var(--accent-gold)">
          <span style="font-size:12px;color:var(--text-secondary)">你的问题</span>
          <p style="font-size:14px;color:var(--text-primary);margin-top:4px">${q}</p>
        </div>
        <div class="card response-card" style="border:1px solid var(--border-gold);display:flex;flex-direction:column;gap:12px">
          <div class="response-header">
            <svg class="response-icon" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#A78BFA" stroke-width="1.5"/><path d="M5 9H13M9 5V13" stroke="#A78BFA" stroke-width="1.5"/></svg>
            <span class="response-title">NY INDEX AI 分析</span>
          </div>
          <p class="response-text">${resp.answer}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(16,185,129,0.15);color:#10B981">热度 ${resp.score}</span>
            <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(167,139,250,0.15);color:#A78BFA">${resp.growth}</span>
            <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(249,115,22,0.15);color:#F97316">风险 ${resp.risk}</span>
          </div>
        </div>
        <section class="section" style="margin-top:16px">
          <h2 class="section-title">智能推荐</h2>
          ${brandsHtml}
          ${shopsHtml}
        </section>
        <div class="action-buttons" style="margin-top:16px">
          <button class="btn-primary" onclick="document.getElementById('ai-input-text').focus()">继续追问</button>
        </div>
      `;
      // 滚动到结果区域
      aiResponse.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  }

  // 按钮点击
  if (aiSendBtn) {
    aiSendBtn.addEventListener('click', (e) => { e.stopPropagation(); aiSend(); });
  }
  // 回车发送
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); aiSend(); }
    });
    // 点击输入框时阻止冒泡（防止触发其他全局点击）
    aiInput.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  // BI tabs
  document.querySelectorAll('#screen-bi .bi-tab').forEach(tab => {
    tab.addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('#screen-bi .bi-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); updateBIData(tab.dataset.type); });
  });
  function updateBIData(type) {
    const area = document.getElementById('bi-chart-area'); const title = document.getElementById('bi-chart-title'); if (!area) return;
    const charts = {
      trend: { title: '趋势热度变化', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><path d="M0 80 C20 70 40 50 60 45S100 30 140 25S200 20 240 15S300 10 326 10" stroke="#A78BFA" stroke-width="2.5" fill="none"/><path d="M0 120 C20 110 40 100 60 95S100 80 140 75S200 65 240 55S300 50 326 45" stroke="#10B981" stroke-width="2.5" fill="none"/></svg>' },
      brand: { title: '品牌热度变化', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><rect x="10" y="20" width="30" height="130" rx="4" fill="#A78BFA" opacity="0.8"/><rect x="50" y="35" width="30" height="115" rx="4" fill="#A78BFA" opacity="0.6"/><rect x="90" y="50" width="30" height="100" rx="4" fill="#10B981" opacity="0.7"/><rect x="130" y="60" width="30" height="90" rx="4" fill="#10B981" opacity="0.5"/></svg>' },
      shop: { title: '档口热力分布', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><circle cx="60" cy="50" r="35" fill="#A78BFA" opacity="0.3"/><circle cx="60" cy="50" r="20" fill="#A78BFA" opacity="0.6"/><text x="60" y="55" font-size="10" fill="#FFFFFF" text-anchor="middle">107栋</text><circle cx="160" cy="70" r="40" fill="#10B981" opacity="0.3"/><circle cx="160" cy="70" r="25" fill="#10B981" opacity="0.6"/><text x="160" y="75" font-size="10" fill="#FFFFFF" text-anchor="middle">108栋</text><circle cx="260" cy="55" r="30" fill="#F97316" opacity="0.3"/><circle cx="260" cy="55" r="18" fill="#F97316" opacity="0.6"/><text x="260" y="60" font-size="10" fill="#FFFFFF" text-anchor="middle">110栋</text></svg>' },
      growth: { title: '风格增长趋势', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><path d="M0 140C30 135 60 120 90 110S150 80 180 60S240 30 270 15S310 5 326 0" stroke="#A78BFA" stroke-width="2.5" fill="none"/></svg>' },
      member: { title: '会员增长趋势', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><path d="M0 130 L46 125 L92 118 L138 105 L184 95 L230 80 L276 65 L326 50" stroke="#A78BFA" stroke-width="2.5" fill="none"/></svg>' },
      purchase: { title: '采购趋势', svg: '<svg viewBox="0 0 326 160" class="chart-svg"><path d="M0 100C30 95 60 80 90 70S150 55 180 50S240 45 270 40" stroke="#10B981" stroke-width="2.5" fill="none"/></svg>' },
    };
    const c = charts[type]; if (!c) return; title.textContent = c.title; area.innerHTML = c.svg;
  }

  // Button feedback
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => { btn.addEventListener('click', () => { btn.style.transform = 'scale(0.98)'; setTimeout(() => btn.style.transform = 'scale(1)', 120); }); });

  // BI stat cards
  bindClick('.bi-stat-card', (el) => { const label = el.querySelector('.bi-stat-label')?.textContent; const value = el.querySelector('.bi-stat-value')?.textContent; const sub = el.querySelector('.bi-stat-sub')?.textContent || ''; openModal(label, `<div class="dm"><div class="dm-hero">${value}<br><small>${sub}</small></div><div class="dm-section"><p class="dm-text">详细数据持续更新中。</p></div></div>`); });

  // Store stat cards
  bindClick('.store-stat-card', (el) => { const label = el.querySelector('.store-stat-label')?.textContent; const value = el.querySelector('.store-stat-value')?.textContent; openModal(label, `<div class="dm"><div class="dm-hero">${value}</div></div>`); });

  // Weather city card — 切换城市后重新拉取天气
  bindClick('.city-card', () => {
    const cities = Object.keys(CITY_MAP);
    const rows = cities.map(c => {
      const isCurrent = c === currentCityKey;
      return `<div class="dm-row" style="cursor:pointer" data-city="${c}"><span class="dm-key">${c}</span>${isCurrent ? '<span class="dm-val gn">当前</span>' : ''}</div>`;
    }).join('');
    openModal('选择城市', `<div class="dm"><div class="dm-section">${rows}</div></div>`);
    // 绑定城市切换
    setTimeout(() => {
      document.querySelectorAll('#modal-body .dm-row[data-city]').forEach(row => {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = row.dataset.city;
          currentCityKey = key;
          document.querySelector('.city-name').textContent = key;
          closeModal();
          fetchWeather(key);
        });
      });
    }, 50);
  });

  // Forecast items
  bindClick('.forecast-item', (el) => { const spans = el.querySelectorAll('.forecast-left span'); const day = spans.length > 0 ? spans[0].textContent : ''; const temp = el.querySelector('.forecast-temp')?.textContent; openModal(day + '天气详情', `<div class="dm"><div class="dm-section"><div class="dm-row"><span class="dm-key">日期</span><span class="dm-val">${day}</span></div><div class="dm-row"><span class="dm-key">温度</span><span class="dm-val gl">${temp}</span></div></div></div>`); });

  // ===== 买手招募 =====
  bindClick('[data-recruit]', (el) => {
    const type = el.dataset.recruit;
    if (type === '推荐官') {
      openModal('招募推荐官', `<div class="dm"><div class="dm-section"><p class="dm-text">推荐好友成为NY INDEX会员，好友下单即可获得佣金奖励。</p><div class="dm-row"><span class="dm-key">推荐奖励</span><span class="dm-val gn">好友首单 5% 佣金</span></div><div class="dm-row"><span class="dm-key">累积奖励</span><span class="dm-val gn">推荐满10人额外 ¥500</span></div><div class="dm-row"><span class="dm-key">结算方式</span><span class="dm-val">T+1 自动到账</span></div></div><div class="dm-section"><button class="btn-primary" style="width:100%;background:#A78BFA;color:#FFFFFF;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;" onclick="closeModal()">立即推荐</button></div></div>`);
    } else if (type === '城市合伙人') {
      openModal('城市合伙人', `<div class="dm"><div class="dm-section"><p class="dm-text">成为城市合伙人，享受区域独家代理权益与分润体系。</p><div class="dm-row"><span class="dm-key">代理区域</span><span class="dm-val">全国各城市独家</span></div><div class="dm-row"><span class="dm-key">分润比例</span><span class="dm-val gn">区域交易 3%-8%</span></div><div class="dm-row"><span class="dm-key">支持政策</span><span class="dm-val">品牌物料 + 培训支持</span></div></div><div class="dm-section"><button class="btn-primary" style="width:100%;background:#A78BFA;color:#FFFFFF;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;" onclick="closeModal()">申请合伙人</button></div></div>`);
    } else if (type === '收益排行') {
      const rankData = [
        { name: '张姐', city: '杭州', amount: '¥18,650' },
        { name: 'Lisa', city: '上海', amount: '¥15,200' },
        { name: '王老板', city: '成都', amount: '¥12,800' },
        { name: 'Anna', city: '深圳', amount: '¥9,500' },
        { name: '陈姐', city: '广州', amount: '¥7,300' }
      ];
      const rows = rankData.map((r, i) => `<div class="dm-row"><span class="dm-key">${i < 3 ? '<span style="color:#A78BFA">●</span> ' : ''}${r.name} · ${r.city}</span><span class="dm-val gn">${r.amount}</span></div>`).join('');
      openModal('收益排行 TOP5', `<div class="dm"><div class="dm-section">${rows}</div></div>`);
    }
  });

  bindClick('#my-commission-card', () => {
    openModal('我的佣金', `<div class="dm"><div class="dm-section"><div class="dm-hero" style="color:#10B981;">¥ 0.00</div><div class="dm-row"><span class="dm-key">本月收益</span><span class="dm-val">¥ 0.00</span></div><div class="dm-row"><span class="dm-key">累计收益</span><span class="dm-val">¥ 0.00</span></div><div class="dm-row"><span class="dm-key">待结算</span><span class="dm-val">¥ 0.00</span></div><div class="dm-row"><span class="dm-key">已提现</span><span class="dm-val">¥ 0.00</span></div></div><div class="dm-section"><p class="dm-text" style="color:#6B7288;">暂无佣金记录，开始推荐好友赚取收益吧！</p></div></div>`);
  });

  // ===== 一键找款 =====
  const uploadInput = document.getElementById('upload-input');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadZone = document.getElementById('upload-zone');
  const aiResultArea = document.getElementById('ai-result-area');
  const aiTagsEl = document.getElementById('ai-tags');
  const aiMatchList = document.getElementById('ai-match-list');

  function showAIResult() {
    // 模拟AI识别结果
    const tags = [
      { label: '风格', value: '静奢风 / 老钱风' },
      { label: '面料', value: '羊毛混纺' },
      { label: '颜色', value: '驼色 / 米白' },
      { label: '关键词', value: '极简、高领、廓形、通勤' }
    ];
    aiTagsEl.innerHTML = tags.map(t => `<div style="background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:8px;padding:8px 12px;"><span style="font-size:11px;color:#6B7288;display:block;">${t.label}</span><span style="font-size:13px;color:#A78BFA;font-weight:600;">${t.value}</span></div>`).join('');
    // 推荐档口
    const matches = [
      { name: '渡己', info: '107栋 1F-F07 | 简约高端/静奢', score: '96' },
      { name: 'MM+', info: '108栋 1F-128F | 网红TOP1', score: '88' },
      { name: '国朴', info: '103栋 1F-A29 | 宋锦天花板', score: '86' },
      { name: '笙歌', info: '107栋 2F-205 | 静奢极简', score: '83' }
    ];
    aiMatchList.innerHTML = matches.map(m => `<div class="vendor-item" style="cursor:pointer;"><div class="vendor-left"><span class="vendor-name">${m.name}</span><span class="vendor-info">${m.info}</span></div><div class="vendor-right"><span class="vendor-score">A+</span><span class="vendor-match green">匹配 ${m.score}%</span></div></div>`).join('');
    aiResultArea.style.display = 'block';
  }

  if (uploadBtn && uploadInput) {
    uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); uploadInput.click(); });
  }
  if (uploadZone && uploadInput) {
    uploadZone.addEventListener('click', (e) => { if (e.target.id !== 'upload-btn') uploadInput.click(); });
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      // 显示加载中
      aiResultArea.style.display = 'block';
      aiTagsEl.innerHTML = '<div style="text-align:center;padding:20px;color:#6B7288;font-size:14px;">AI 识别中…</div>';
      aiMatchList.innerHTML = '';
      setTimeout(() => { showAIResult(); }, 1500);
    });
  }

  // ===== 半山邀 =====
  bindClick('[data-bs]', (el) => {
    const type = el.dataset.bs;
    if (type === '主理人') {
      openModal('半山主理人', `<div class="dm"><div class="dm-section"><p class="dm-text" style="color:#A78BFA;font-weight:600;">邀请对象</p><div class="dm-row"><span class="dm-key">年销售额</span><span class="dm-val gn">3000万+</span></div><div class="dm-row"><span class="dm-key">门店规模</span><span class="dm-val gn">单店10家+</span></div><div class="dm-row"><span class="dm-key">供应链</span><span class="dm-val gn">有供应链能力</span></div><div class="dm-row"><span class="dm-key">品牌力</span><span class="dm-val gn">有品牌影响力</span></div></div><div class="dm-section"><p class="dm-text" style="color:#A78BFA;">负责分享，例如：</p><p class="dm-text">《我如何从一个档口做到年销5000万》</p><p class="dm-text">《实体店如何突破流量瓶颈》</p></div></div>`);
    } else if (type === '观察员') {
      openModal('半山观察员', `<div class="dm"><div class="dm-section"><p class="dm-text" style="color:#A78BFA;font-weight:600;">邀请对象</p><p class="dm-text">优秀实体店老板</p></div><div class="dm-section"><p class="dm-text" style="color:#A78BFA;">他们提供：真实市场反馈</p><p class="dm-text">例如：</p><p class="dm-text">· 杭州最近卖什么？</p><p class="dm-text">· 成都消费者变化？</p></div></div>`);
    } else if (type === '同行者') {
      openModal('半山同行者', `<div class="dm"><div class="dm-section"><p class="dm-text" style="color:#A78BFA;font-weight:600;">普通会员</p><p class="dm-text">通过申请加入半山邀私享会，参与每月一次的交流活动。</p></div><div class="dm-section"><button class="btn-primary" style="width:100%;background:#F97316;color:#fff;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;" onclick="closeModal()">立即申请</button></div></div>`);
    }
  });

  bindClick('#bs-apply-card', () => {
    openModal('申请加入半山邀', `<div class="dm"><div class="dm-section"><div class="dm-row"><span class="dm-key">姓名</span><span class="dm-val">请填写</span></div><div class="dm-row"><span class="dm-key">店铺名称</span><span class="dm-val">请填写</span></div><div class="dm-row"><span class="dm-key">年销售额</span><span class="dm-val">请选择</span></div><div class="dm-row"><span class="dm-key">申请身份</span><span class="dm-val">同行者</span></div></div><div class="dm-section"><button class="btn-primary" style="width:100%;background:#F97316;color:#fff;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;" onclick="closeModal()">提交申请</button></div></div>`);
  });

  // ===== 今日任务 =====
  let taskStates = [false, false, false, false, false];
  document.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(item.dataset.task);
      taskStates[idx] = !taskStates[idx];
      const check = item.querySelector('.task-check');
      const name = item.querySelector('.rank-name');
      if (taskStates[idx]) {
        check.style.background = '#10B981';
        check.style.borderColor = '#10B981';
        check.innerHTML = '<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px;"><path d="M3 8l3.5 3.5L13 5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        name.style.color = '#10B981';
        name.style.textDecoration = 'line-through';
      } else {
        check.style.background = '';
        check.style.borderColor = '#E5E7EB';
        check.innerHTML = '';
        name.style.color = '';
        name.style.textDecoration = '';
      }
      const done = taskStates.filter(t => t).length;
      const progressEl = document.getElementById('task-progress');
      const barEl = document.getElementById('task-bar');
      if (progressEl) progressEl.textContent = `${done} / 5`;
      if (barEl) barEl.style.width = `${(done / 5) * 100}%`;
    });
  });

  // ===== 登录系统 =====
  const USER_KEY = 'nyindex_user';
  let currentUser = null;

  // 从 localStorage 读取用户数据
  function loadUser() {
    try { const data = localStorage.getItem(USER_KEY); if (data) currentUser = JSON.parse(data); } catch(e) {}
    return currentUser;
  }
  function saveUser(user) {
    currentUser = user;
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch(e) {}
  }

  // 检查是否已登录，未登录显示登录页
  const savedUser = loadUser();
  if (!savedUser) {
    showScreen('login');
  } else {
    fillMePage(savedUser);
  }

  // 风格标签多选
  document.querySelectorAll('#login-style-tags .style-tag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
    });
  });

  // 登录提交
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nameEl = document.getElementById('login-name');
      const phoneEl = document.getElementById('login-phone');
      const storeEl = document.getElementById('login-store');
      const cityEl = document.getElementById('login-city');
      const errorEl = document.getElementById('login-error');

      const name = nameEl?.value.trim();
      const phone = phoneEl?.value.trim();
      const store = storeEl?.value.trim();
      const city = cityEl?.value;

      // 收集选中的风格
      const styles = [];
      document.querySelectorAll('#login-style-tags .style-tag-btn.active').forEach(b => { styles.push(b.dataset.style); });

      // 验证
      if (!name) { errorEl.textContent = '请输入姓名'; return; }
      if (!phone || phone.length < 11) { errorEl.textContent = '请输入正确的手机号'; return; }
      if (!city) { errorEl.textContent = '请选择城市'; return; }

      // 构建用户数据
      const user = {
        name: name,
        phone: phone,
        store: store || '暂未填写',
        city: city,
        styles: styles.length > 0 ? styles.join(' / ') : '暂未选择',
        regDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
        avatarLetter: name.charAt(0)
      };

      saveUser(user);
      errorEl.textContent = '';

      // 填充"我"页面
      fillMePage(user);
      // 更新首页问候语
      updateHomeGreeting(user);

      // 进入首页
      showScreen('home');
    });
  }

  // 填充"我"页面数据
  function fillMePage(user) {
    if (!user) return;
    const nameEl = document.getElementById('me-name');
    const roleEl = document.getElementById('me-role');
    const storeEl = document.getElementById('me-store');
    const cityEl = document.getElementById('me-city');
    const styleEl = document.getElementById('me-style');
    const phoneEl = document.getElementById('me-phone');
    const regdateEl = document.getElementById('me-regdate');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.styles && user.styles !== '暂未选择' ? user.styles + ' 经营者' : '高端女装经营者';
    if (storeEl) storeEl.textContent = user.store;
    if (cityEl) cityEl.textContent = user.city;
    if (styleEl) styleEl.textContent = user.styles;
    if (phoneEl) phoneEl.textContent = user.phone ? user.phone.substring(0,3) + '****' + user.phone.substring(7) : '';
    if (regdateEl) regdateEl.textContent = user.regDate;
    updateAvatarDisplay(user);
  }

  // 更新首页问候语
  function updateHomeGreeting(user) {
    if (!user) return;
    const greetingEl = document.querySelector('.greeting-text');
    if (greetingEl) {
      const hour = new Date().getHours() + 8; // Beijing time offset
      const bjHour = hour >= 24 ? hour - 24 : hour;
      let greeting = '晚上好';
      if (bjHour >= 5 && bjHour < 12) greeting = '早上好';
      else if (bjHour >= 12 && bjHour < 18) greeting = '下午好';
      greetingEl.textContent = `${greeting}，${user.name}`;
    }
    updateAvatarDisplay(user);
  }

  // 同步更新所有头像显示（首页 + "我"页面）
  function updateAvatarDisplay(user) {
    if (!user) return;
    const letter = user.avatarLetter || user.name?.charAt(0) || 'U';
    // 首页头像
    const homeAvatar = document.getElementById('home-avatar');
    if (homeAvatar) {
      if (user.avatarImg) {
        homeAvatar.classList.add('has-image');
        homeAvatar.innerHTML = `<img src="${user.avatarImg}" alt="头像"><input type="file" accept="image/*" id="avatar-file-input" style="display:none">`;
      } else {
        homeAvatar.classList.remove('has-image');
        homeAvatar.innerHTML = `<span>${letter}</span><input type="file" accept="image/*" id="avatar-file-input" style="display:none">`;
      }
    }
    // "我"页面头像
    const meAvatar = document.getElementById('me-avatar');
    if (meAvatar) {
      if (user.avatarImg) {
        meAvatar.innerHTML = `<img src="${user.avatarImg}" alt="头像" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span style="position:absolute;bottom:0;right:0;width:20px;height:20px;border-radius:50%;background:#FFFFFF;border:2px solid #A78BFA;display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 16 16" fill="none" style="width:10px;height:10px"><path d="M8 3v10M3 8h10" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/></svg></span><input type="file" accept="image/*" id="me-avatar-file-input" style="display:none">`;
        meAvatar.style.background = 'none';
      } else {
        meAvatar.innerHTML = `${letter}<span style="position:absolute;bottom:0;right:0;width:20px;height:20px;border-radius:50%;background:#FFFFFF;border:2px solid #A78BFA;display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 16 16" fill="none" style="width:10px;height:10px"><path d="M8 3v10M3 8h10" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/></svg></span><input type="file" accept="image/*" id="me-avatar-file-input" style="display:none">`;
        meAvatar.style.background = 'linear-gradient(135deg,#A78BFA,#8B5CF6)';
      }
    }
  }

  // "我"页面头像点击 → 同样触发头像上传
  bindClick('#me-avatar', () => {
    document.querySelector('.avatar')?.click();
  });

  // "我"页面编辑按钮 → 打开登录modal修改信息
  bindClick('#me-edit-btn', () => {
    const user = loadUser() || {};
    openModal('修改个人信息', `<div class="dm"><div class="dm-section">
      <div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">姓名</span><input type="text" id="edit-name" value="${user.name || ''}" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div>
      <div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">手机号</span><input type="tel" id="edit-phone" value="${user.phone || ''}" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div>
      <div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">店铺名称</span><input type="text" id="edit-store" value="${user.store || ''}" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div>
      <div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">所在城市</span><input type="text" id="edit-city" value="${user.city || ''}" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div>
      <div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">主营风格</span><input type="text" id="edit-styles" value="${user.styles || ''}" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div>
      <div class="dm-actions" style="margin-top:16px"><button class="btn-primary" id="edit-save-btn" style="cursor:pointer;width:100%">保存修改</button></div>
    </div></div>`);
    // 保存按钮事件
    setTimeout(() => {
      const saveBtn = document.getElementById('edit-save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const updated = {
            name: document.getElementById('edit-name')?.value.trim() || user.name,
            phone: document.getElementById('edit-phone')?.value.trim() || user.phone,
            store: document.getElementById('edit-store')?.value.trim() || user.store,
            city: document.getElementById('edit-city')?.value.trim() || user.city,
            styles: document.getElementById('edit-styles')?.value.trim() || user.styles,
            regDate: user.regDate || new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
            avatarLetter: (document.getElementById('edit-name')?.value.trim() || user.name).charAt(0),
            avatarImg: user.avatarImg || null
          };
          saveUser(updated);
          fillMePage(updated);
          updateHomeGreeting(updated);
          closeModal();
        });
      }
    }, 100);
  });

  /* ============ 档口中心：档口主自助上传产品图 ============ */
  const STALL_TOKEN_KEY = 'ny_stall_token';
  const STALL_INFO_KEY = 'ny_stall_info';

  function getStallToken() { return localStorage.getItem(STALL_TOKEN_KEY); }
  function getStallInfo() { try { return JSON.parse(localStorage.getItem(STALL_INFO_KEY) || 'null'); } catch (e) { return null; } }

  async function apiJSON(path, opts = {}) {
    const headers = Object.assign({}, opts.headers || {});
    const token = getStallToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    try {
      const res = await fetch(path, { method: opts.method || 'GET', headers, body: opts.body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ('请求失败 ' + res.status));
      return data;
    } catch (e) {
      if (e.message === 'Failed to fetch') throw new Error('后端未连接：请先在本地运行 server（node server.js）');
      throw e;
    }
  }

  function updateStallCenterSub() {
    const sub = document.getElementById('me-stall-center-sub');
    const info = getStallInfo();
    if (sub) sub.textContent = info ? ('已登录：' + info.name) : '我是档口主 · 上传我的产品图';
  }

  function openStallCenter() {
    const info = getStallInfo();
    if (info && getStallToken()) renderStallDashboard();
    else renderStallAuth();
  }

  function renderStallAuth() {
    openModal('档口中心', `<div class="dm"><div class="stall-tabs"><button class="stall-tab active" data-mode="login">登录</button><button class="stall-tab" data-mode="register">注册认领</button></div><div id="stall-auth-body"></div><p class="stall-tip">注册即认领该档口，认领后他人无法再用此名称注册。</p></div>`);
    document.querySelectorAll('.stall-tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.stall-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      renderStallAuthForm(t.dataset.mode);
    }));
    renderStallAuthForm('login');
  }

  async function renderStallAuthForm(mode) {
    const body = document.getElementById('stall-auth-body');
    if (!body) return;
    if (mode === 'login') {
      body.innerHTML = `<div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">档口名称</span><input id="stall-name" placeholder="如 CHIC JISHE" style="width:100%;height:40px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:10px;padding:0 12px;color:#1A1D2D;font-size:14px"></div><div class="dm-row" style="flex-direction:column;gap:6px;margin-top:10px"><span class="dm-key">密码</span><input id="stall-pwd" type="password" placeholder="请输入密码" style="width:100%;height:40px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:10px;padding:0 12px;color:#1A1D2D;font-size:14px"></div><button class="btn-primary" id="stall-auth-btn" style="width:100%;margin-top:16px;cursor:pointer">登录</button>`;
      document.getElementById('stall-auth-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const name = (document.getElementById('stall-name').value || '').trim();
        const pwd = document.getElementById('stall-pwd').value;
        if (!name || !pwd) return alert('请填写档口名称和密码');
        try {
          const r = await apiJSON('/api/stall/login', { method: 'POST', body: JSON.stringify({ name, password: pwd }) });
          localStorage.setItem(STALL_TOKEN_KEY, r.token);
          localStorage.setItem(STALL_INFO_KEY, JSON.stringify(r.stall));
          updateStallCenterSub();
          renderStallDashboard();
        } catch (err) { alert(err.message); }
      });
    } else {
      body.innerHTML = `<div class="dm-row" style="flex-direction:column;gap:6px"><span class="dm-key">选择你的档口</span><select id="stall-select" style="width:100%;height:40px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:10px;padding:0 12px;color:#1A1D2D;font-size:14px"><option>加载中...</option></select></div><div class="dm-row" style="flex-direction:column;gap:6px;margin-top:10px"><span class="dm-key">设置密码</span><input id="stall-pwd" type="password" placeholder="至少4位" style="width:100%;height:40px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:10px;padding:0 12px;color:#1A1D2D;font-size:14px"></div><button class="btn-primary" id="stall-auth-btn" style="width:100%;margin-top:16px;cursor:pointer">认领并注册</button>`;
      try {
        const list = await apiJSON('/api/stalls');
        const sel = document.getElementById('stall-select');
        sel.innerHTML = list.map(s => `<option value="${s.name}">${s.name} — ${s.building}${s.floor}-${s.room}</option>`).join('');
      } catch (err) { const sel = document.getElementById('stall-select'); if (sel) sel.innerHTML = '<option>加载失败</option>'; }
      document.getElementById('stall-auth-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const sel = document.getElementById('stall-select');
        const name = sel ? sel.value : '';
        const pwd = document.getElementById('stall-pwd').value;
        if (!name || !pwd || pwd.length < 4) return alert('请选择档口并设置至少4位密码');
        try {
          const r = await apiJSON('/api/stall/register', { method: 'POST', body: JSON.stringify({ name, password: pwd }) });
          localStorage.setItem(STALL_TOKEN_KEY, r.token);
          localStorage.setItem(STALL_INFO_KEY, JSON.stringify(r.stall));
          updateStallCenterSub();
          renderStallDashboard();
        } catch (err) { alert(err.message); }
      });
    }
  }

  async function renderStallDashboard() {
    const info = getStallInfo() || {};
    openModal('我的档口 · ' + (info.name || ''), `<div class="dm"><div class="dm-section"><div class="dm-row"><span class="dm-key">位置</span><span class="dm-val">${info.building || ''} ${info.floor || ''}-${info.room || ''}</span></div><div class="dm-row"><span class="dm-key">风格</span><span class="dm-val gl">${info.style || ''}</span></div></div><div class="dm-section"><span class="dm-title">上传产品图</span><div class="stall-upload-box" id="stall-upload-box"><svg viewBox="0 0 24 24" fill="none" style="width:28px;height:28px"><path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="#A78BFA" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20H20V16" stroke="#A78BFA" stroke-width="1.6" stroke-linecap="round"/></svg><span style="font-size:13px;color:#6B7288;margin-top:6px">点击拍照 / 从相册选择</span></div><input type="file" id="stall-file" accept="image/*" capture="environment" style="display:none"><div class="dm-row" style="flex-direction:column;gap:6px;margin-top:10px"><span class="dm-key">图片说明（选填）</span><input id="stall-caption" placeholder="如：春季新款连衣裙" style="width:100%;height:36px;background:#F0F2F6;border:1px solid #D1D5DB;border-radius:8px;padding:0 12px;color:#1A1D2D;font-size:14px"></div></div><div class="dm-section"><span class="dm-title">我的产品图</span><div id="stall-products" class="stall-products">加载中...</div></div><div class="dm-actions" style="display:flex;gap:10px;margin-top:8px"><button class="btn-ghost" id="stall-logout-btn" style="flex:1;cursor:pointer">退出登录</button></div></div>`);

    const box = document.getElementById('stall-upload-box');
    const fileInput = document.getElementById('stall-file');
    if (box) box.addEventListener('click', () => fileInput && fileInput.click());
    if (fileInput) fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const caption = (document.getElementById('stall-caption').value || '').trim();
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      box.innerHTML = '<span style="font-size:13px;color:#A78BFA">上传中...</span>';
      try {
        await apiJSON('/api/stall/upload', { method: 'POST', body: fd });
        fileInput.value = '';
        alert('上传成功，等待管理员审核');
        loadStallProducts();
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="width:28px;height:28px"><path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="#A78BFA" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20H20V16" stroke="#A78BFA" stroke-width="1.6" stroke-linecap="round"/></svg><span style="font-size:13px;color:#6B7288;margin-top:6px">点击拍照 / 从相册选择</span>';
      } catch (err) { alert(err.message); box.innerHTML = '<span style="font-size:13px;color:#6B7288">点击重试</span>'; }
    });

    const logoutBtn = document.getElementById('stall-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.removeItem(STALL_TOKEN_KEY);
      localStorage.removeItem(STALL_INFO_KEY);
      updateStallCenterSub();
      renderStallAuth();
    });

    loadStallProducts();
  }

  async function loadStallProducts() {
    const el = document.getElementById('stall-products');
    if (!el) return;
    try {
      const r = await apiJSON('/api/stall/me');
      if (!r.products.length) { el.innerHTML = '<div class="stall-empty">还没有上传产品图</div>'; return; }
      el.innerHTML = r.products.map(p => `<div class="stall-product"><img src="${p.url}" style="width:64px;height:64px;border-radius:10px;object-fit:cover"><div style="flex:1"><div style="font-size:13px;color:#1A1D2D">${p.caption || '未命名'}</div><span class="stall-badge ${p.status}">${p.status === 'pending' ? '待审核' : p.status === 'approved' ? '已通过' : '已拒绝'}</span></div></div>`).join('');
    } catch (err) { el.innerHTML = '<div class="stall-empty">加载失败：' + err.message + '</div>'; }
  }

  bindClick('#me-stall-center', () => { openStallCenter(); });
  updateStallCenterSub();

  // "我"页面功能入口
  bindClick('#me-my-commission', () => {
    const user = loadUser();
    openModal('我的佣金', `<div class="dm"><div class="dm-hero">¥ 0.00<br><small>累计佣金</small></div><div class="dm-section"><p class="dm-text">完善买手信息后可开启佣金系统</p></div></div>`);
  });
  bindClick('#me-my-orders', () => { openModal('我的订单', `<div class="dm"><div class="dm-section"><p class="dm-text">暂无订单记录</p></div></div>`) });
  bindClick('#me-my-favorites', () => { openModal('我的收藏', `<div class="dm"><div class="dm-section"><p class="dm-text">暂无收藏</p></div></div>`) });
  bindClick('#me-settings', () => {
    openModal('设置', `<div class="dm"><div class="dm-section">
      <div class="dm-row" style="cursor:pointer" id="settings-clear-data"><span class="dm-key">清除本地数据</span><span class="dm-val" style="color:#F97316">清除</span></div>
      <div class="dm-row"><span class="dm-key">版本</span><span class="dm-val">v1.0</span></div>
    </div></div>`);
    setTimeout(() => {
      const clearBtn = document.getElementById('settings-clear-data');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          localStorage.removeItem(USER_KEY);
          currentUser = null;
          closeModal();
          showScreen('login');
        });
      }
    }, 100);
  });

  // ===== AI换装模块 =====
  const aiclothModelImages = []; // 存储模特图 data URLs
  const aiclothOutfitImages = []; // 存储穿搭图 data URLs

  // AI换装入口
  bindClick('#ai-cloth-entry', () => { showScreen('aicloth'); });

  // 约束条件折叠展开
  bindClick('#aicloth-rules-toggle', () => {
    const body = document.getElementById('aicloth-rules-body');
    const chevron = document.getElementById('aicloth-rules-chevron');
    if (body) {
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      if (chevron) chevron.style.transform = isHidden ? 'rotate(180deg)' : '';
    }
  });

  // 图片上传处理
  function setupAiclothUploads() {
    // 点击slot触发文件选择
    document.querySelectorAll('.aicloth-upload-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        // 如果已填满图片，不触发上传
        if (slot.classList.contains('aicloth-slot-filled')) return;
        // 触发file input
        const fileInput = slot.querySelector('.aicloth-file-input');
        if (fileInput) fileInput.click();
      });
    });

    // file input change事件处理
    document.querySelectorAll('.aicloth-file-input').forEach(input => {
      input.addEventListener('change', (e) => {
        e.stopPropagation();
        const file = e.target.files[0];
        if (!file) return;
        const target = input.dataset.target;
        const isModel = target.startsWith('model');
        const idx = parseInt(target.split('-')[1]);

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          if (isModel) {
            aiclothModelImages[idx] = dataUrl;
          } else {
            aiclothOutfitImages[idx] = dataUrl;
          }
          updateAiclothSlot(target, dataUrl, isModel);
          activateNextSlot(isModel, idx + 1);
          checkAiclothReady();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function updateAiclothSlot(target, dataUrl, isModel) {
    const slot = document.querySelector(`.aicloth-upload-slot[data-slot="${target}"]`);
    if (!slot) return;
    const inner = slot.querySelector('.aicloth-slot-inner');
    if (inner) {
      inner.innerHTML = `<img src="${dataUrl}" class="aicloth-preview-img" /><button class="aicloth-remove-btn" data-remove="${target}"><svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><circle cx="8" cy="8" r="7" fill="#2D3142" opacity="0.7"/><path d="M5 5l6 6M11 5l-6 6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg></button>`;
      inner.classList.remove('aicloth-slot-dim');
      slot.classList.remove('aicloth-slot-placeholder');
      slot.classList.add('aicloth-slot-filled');
    }
    // 绑定删除按钮
    const removeBtn = inner?.querySelector('.aicloth-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeTarget = removeBtn.dataset.remove;
        const isM = removeTarget.startsWith('model');
        const ri = parseInt(removeTarget.split('-')[1]);
        if (isM) { aiclothModelImages[ri] = undefined; } else { aiclothOutfitImages[ri] = undefined; }
        // 重置slot
        resetAiclothSlot(removeTarget, isM);
        checkAiclothReady();
      });
    }
  }

  function resetAiclothSlot(target, isModel) {
    const slot = document.querySelector(`.aicloth-upload-slot[data-slot="${target}"]`);
    if (!slot) return;
    const idx = parseInt(target.split('-')[1]);
    slot.classList.remove('aicloth-slot-filled');
    slot.classList.add('aicloth-slot-placeholder');
    const inner = slot.querySelector('.aicloth-slot-inner');
    if (inner) {
      if (idx === 0) {
        // 第一个slot恢复添加图标
        const accentColor = isModel ? '#A78BFA' : '#10B981';
        const label = isModel ? '添加模特' : '添加穿搭';
        const addIcon = isModel
          ? `<circle cx="8" cy="5" r="3" stroke="${accentColor}" stroke-width="1.5"/><path d="M3 14c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="${accentColor}" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>`
          : `<rect x="4" y="4" width="16" height="16" rx="2" stroke="${accentColor}" stroke-width="1.5"/><path d="M9 8v8M7 12h4" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>`;
        inner.innerHTML = `<svg viewBox="0 0 24 24" fill="none" class="aicloth-add-icon">${addIcon}</svg><span class="aicloth-slot-label" style="color:${accentColor}">${label}</span>`;
        inner.classList.remove('aicloth-slot-dim');
      } else {
        // 后续slot恢复简单的加号
        inner.innerHTML = `<svg viewBox="0 0 24 24" fill="none" class="aicloth-add-icon aicloth-add-dim"><path d="M12 8v8M8 12h8" stroke="#6B7288" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        inner.classList.add('aicloth-slot-dim');
      }
    }
    // 重置file input
    const fileInput = slot.querySelector('.aicloth-file-input');
    if (fileInput) fileInput.value = '';
  }

  function activateNextSlot(isModel, nextIdx) {
    if (nextIdx > 2) return;
    const prefix = isModel ? 'model' : 'outfit';
    const nextSlot = document.querySelector(`.aicloth-upload-slot[data-slot="${prefix}-${nextIdx}"]`);
    if (nextSlot && nextSlot.classList.contains('aicloth-slot-placeholder')) {
      // 让下一个slot变为可添加状态（显示加号更明显）
      const inner = nextSlot.querySelector('.aicloth-slot-inner');
      if (inner) {
        const accentColor = isModel ? '#A78BFA' : '#10B981';
        inner.innerHTML = `<svg viewBox="0 0 24 24" fill="none" class="aicloth-add-icon"><path d="M12 8v8M8 12h8" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        inner.classList.remove('aicloth-slot-dim');
      }
      nextSlot.classList.remove('aicloth-slot-placeholder');
    }
  }

  function checkAiclothReady() {
    const hasModel = aiclothModelImages.some(img => img);
    const hasOutfit = aiclothOutfitImages.some(img => img);
    const generateArea = document.getElementById('aicloth-generate-area');
    if (generateArea) {
      generateArea.style.display = (hasModel && hasOutfit) ? 'block' : 'none';
    }
  }

  // 生成按钮逻辑
  const aiclothGenBtn = document.getElementById('aicloth-generate-btn');
  if (aiclothGenBtn) {
    aiclothGenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startAiclothGeneration();
    });
  }

  function startAiclothGeneration() {
    // 隐藏生成按钮和上传区域
    const genArea = document.getElementById('aicloth-generate-area');
    if (genArea) genArea.style.display = 'none';

    // 显示加载态
    const loading = document.getElementById('aicloth-loading');
    if (loading) loading.style.display = 'block';

    // 隐藏结果区域
    const resultsArea = document.getElementById('aicloth-results-area');
    if (resultsArea) resultsArea.style.display = 'none';

    // 模拟AI生成过程（测试阶段用延时模拟）
    setTimeout(() => {
      // 隐藏加载态
      if (loading) loading.style.display = 'none';

      // 显示结果区域
      if (resultsArea) resultsArea.style.display = 'block';

      // 在第一个结果slot中显示模拟结果（使用模特图作为占位，标注"AI变装结果·测试版"）
      const result0 = document.getElementById('aicloth-result-0');
      if (result0) {
        const modelImg = aiclothModelImages.find(img => img);
        if (modelImg) {
          result0.innerHTML = `<div class="aicloth-result-filled"><img src="${modelImg}" class="aicloth-result-img"/><div class="aicloth-result-badge">AI变装结果 · 测试版</div></div>`;
        }
      }

      // 显示重新生成按钮
      const regenBtn = document.getElementById('aicloth-regen-btn');
      if (regenBtn) regenBtn.style.display = 'flex';

    }, 3000); // 3秒模拟生成
  }

  // 重新生成按钮
  const aiclothRegenBtn = document.getElementById('aicloth-regen-btn');
  if (aiclothRegenBtn) {
    aiclothRegenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startAiclothGeneration();
    });
  }

  setupAiclothUploads();

  // AI决策中心入口（从AI获客页面跳转）
  bindClick('#ai-decision-entry', () => { showScreen('ai'); });

}); // end DOMContentLoaded

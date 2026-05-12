/* =========================
   1) PWA / iOS 視窗高度修正
   ========================= */
(function setAppHeightVar() {
  const apply = () => {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${h}px`);
  };

  apply();

  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('orientationchange', apply, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) apply();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', apply, { passive: true });
    window.visualViewport.addEventListener('scroll', apply, { passive: true });
  }
})();

/* =========================
   2) Google Map 初始化
   ========================= */
let map;
let userMarker;

window.initMap = function initMap() {
  // 預設中心：香港（你可改成沙田/常用）
  const hk = { lat: 22.3193, lng: 114.1694 };

  map = new google.maps.Map(document.getElementById('map'), {
    center: hk,
    zoom: 12,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: false,
    gestureHandling: 'greedy', // 手機拖曳更爽
  });

  // 初次載入也做一次 resize（有助 PWA 初始渲染）
  setTimeout(() => refreshMapLayout(), 50);

  bindUI();
};

/* =========================
   3) UI 行為
   ========================= */
function bindUI() {
  const locBtn = document.getElementById('locBtn');
  const planBtn = document.getElementById('planBtn');

  locBtn?.addEventListener('click', () => {
    locateUser(true);
  });

  planBtn?.addEventListener('click', () => {
    // 你之後可接入 directions / cost calc
    alert('下一步：接入路線規劃（Directions API）');
  });

  // 視窗回來前台 / 旋轉後，強制 Google Map resize
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshMapLayout();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => refreshMapLayout(), 250);
  });

  // visualViewport 變動亦 refresh（iOS PWA 常用）
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      refreshMapLayout();
    }, { passive: true });
  }
}

/* =========================
   4) Map Resize 修復（避免黑邊/空白）
   ========================= */
function refreshMapLayout() {
  if (!map || !window.google || !google.maps) return;
  const center = map.getCenter();
  google.maps.event.trigger(map, 'resize');
  if (center) map.setCenter(center);
}

/* =========================
   5) 定位（可選）
   ========================= */
function locateUser(pan = false) {
  if (!navigator.geolocation) {
    alert('此瀏覽器不支援定位');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      if (!userMarker) {
        userMarker = new google.maps.Marker({
          position: latLng,
          map,
          title: '目前位置',
        });
      } else {
        userMarker.setPosition(latLng);
      }

      if (pan) {
        map.panTo(latLng);
        map.setZoom(15);
      }
    },
    (err) => {
      console.warn(err);
      alert('定位失敗：請允許定位權限');
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
  );
}
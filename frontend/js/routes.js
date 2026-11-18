// Bảng route: thêm trang = thêm một file frontend/js/pages/<tên>.js và một dòng ở đây (plan.md 3.2 mục 5).
// num + icon: mục có trên rail (01–05). more: nằm trong mục "Thêm" của tab bar mobile.

export const routes = [
  { path: '/giam-sat',  id: 'monitor',  num: '01', icon: 'gauge',      navKey: 'nav.monitor',  titleKey: 'page.monitor.title',  load: () => import('./pages/monitor.js') },
  { path: '/den-led',   id: 'led',      num: '02', icon: 'lightbulb',  navKey: 'nav.led',      titleKey: 'page.led.title',      load: () => import('./pages/led.js') },
  { path: '/lich-su',   id: 'history',  num: '03', icon: 'chart-line', navKey: 'nav.history',  titleKey: 'page.history.title',  load: () => import('./pages/history.js') },
  { path: '/telegram',  id: 'telegram', num: '04', icon: 'send',       navKey: 'nav.telegram', titleKey: 'page.telegram.title', load: () => import('./pages/telegram.js') },
  { path: '/thiet-bi',  id: 'device',   num: '05', icon: 'box',        navKey: 'nav.device',   titleKey: 'page.device.title',   load: () => import('./pages/device.js'), more: true },
  { path: '/tai-khoan', id: 'account',                icon: 'user',       navKey: 'nav.account',  titleKey: 'page.account.title',  load: () => import('./pages/account.js'), more: true },
  { path: '/dang-nhap', id: 'login',                                                           titleKey: 'page.login.title',    load: () => import('./pages/login.js') },
];

export const redirects = { '/': '/giam-sat' };

export const notFound = {
  path: null, id: 'notFound', titleKey: 'page.notFound.title', load: () => import('./pages/not-found.js'),
};

/** 5 mục trên rail, theo thứ tự đánh số. */
export const railRoutes = routes.filter((r) => r.num);
/** 4 mục đầu của tab bar mobile; mục thứ 5 là "Thêm". */
export const tabRoutes = routes.filter((r) => r.num && !r.more);
/** Danh sách trong "Thêm". */
export const moreRoutes = routes.filter((r) => r.more);

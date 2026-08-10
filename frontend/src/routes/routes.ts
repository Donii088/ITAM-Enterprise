export const routes = {
  login: '/login',
  unauthorized: '/unauthorized',
  notFound: '/404',
  dashboard: '/dashboard',
  profile: '/profile',
  search: '/search',
  myAssets: '/my-assets',
  assets: {
    list: '/assets',
    detail: (id: string) => `/assets/${id}`,
  },
  assignments: {
    list: '/assignments',
  },
  tickets: {
    list: '/tickets',
    mine: '/tickets/mine',
    detail: (id: string) => `/tickets/${id}`,
  },
  repairs: {
    list: '/repairs',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
  },
} as const;

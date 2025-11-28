const resolveDefaultBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'https://zenithscs.com.au/api';
  }

  const origin = window.location.origin;

  if (origin.includes('zenithscs.com.au')) {
    return `${origin.replace(/\/$/, '')}/api`;
  }

  return 'https://zenithscs.com.au/api';
};

const rawBase =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.__ZENITH_ADMIN_API__ : null) ||
  resolveDefaultBaseUrl();

const API_BASE_URL = rawBase.replace(/\/$/, '');

let csrfToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token || null;
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const buildUrl = (endpoint, params) => {
  const sanitized = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = new URL(`${API_BASE_URL}/${sanitized}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, value);
    });
  }

  return url;
};

const parseJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { success: false, message: 'Invalid server response', raw: text };
  }
};

export const apiFetch = async (
  endpoint,
  { method = 'GET', body, headers = {}, params } = {}
) => {
  const url = buildUrl(endpoint, params);

  const finalHeaders = {
    ...jsonHeaders,
    ...headers,
  };

  if (csrfToken && method !== 'GET' && method !== 'OPTIONS') {
    finalHeaders['X-CSRF-Token'] = csrfToken;
  }

  const options = {
    method,
    headers: finalHeaders,
    credentials: 'include',
  };

  if (body !== undefined && body !== null) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  } else if (method === 'GET') {
    delete options.headers['Content-Type'];
  }

  const response = await fetch(url, options);
  const data = await parseJson(response);

  if (!response.ok || data?.success === false) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

export const authApi = {
  login: ({ username, password }) =>
    apiFetch('login.php', {
      method: 'POST',
      body: { username, password },
    }),
  logout: () =>
    apiFetch('logout.php', {
      method: 'POST',
    }),
  check: () =>
    apiFetch('check-auth.php', {
      method: 'GET',
    }),
};

export const inboxApi = {
  list: (params) =>
    apiFetch('get-emails.php', {
      method: 'GET',
      params,
    }),
  markRead: (id) =>
    apiFetch('mark-email-read.php', {
      method: 'POST',
      body: { id },
    }),
  remove: (id) =>
    apiFetch('delete-email.php', {
      method: 'DELETE',
      body: { id },
    }),
};

export const usersApi = {
  list: () =>
    apiFetch('list-users.php', {
      method: 'GET',
    }),
  create: (payload) =>
    apiFetch('create-user.php', {
      method: 'POST',
      body: payload,
    }),
  update: ({ id, ...updates }) =>
    apiFetch('update-user.php', {
      method: 'POST',
      body: { id, ...updates },
    }),
  toggleStatus: (id) =>
    apiFetch('toggle-user-status.php', {
      method: 'POST',
      body: { id },
    }),
  changePassword: ({ id, newPassword }) =>
    apiFetch('change-user-password.php', {
      method: 'POST',
      body: { id, new_password: newPassword },
    }),
  delete: (id) =>
    apiFetch('delete-user.php', {
      method: 'POST',
      body: { id },
    }),
};

export const emailsApi = inboxApi;

export const dashboardApi = {
  getStats: () =>
    apiFetch('get-dashboard-stats.php', {
      method: 'GET',
    }),
};



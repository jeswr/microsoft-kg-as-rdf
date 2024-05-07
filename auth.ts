import 'dotenv/config';

export const authFetch: typeof fetch = (url, options) => fetch(url, {
    ...options,
    headers: {
        ...options?.headers,
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
    }
});



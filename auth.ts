import 'dotenv/config';

export const authFetch: typeof fetch = (url: Parameters<typeof fetch>[0], options: Parameters<typeof fetch>[1]) => fetch(url, {
    ...options,
    headers: {
        ...options?.headers,
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
    }
});

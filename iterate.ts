import { authFetch } from './auth';

export async function* iterate<T>(startLink: string): AsyncIterableIterator<T> {
    let link: string | undefined = startLink;

    while (link) {
        const res = await authFetch(link);
        const firstMessage = (await res.json() as { value: T[]; '@odata.nextLink'?: string; });
        yield* firstMessage.value;
        link = firstMessage['@odata.nextLink'];
    }
}

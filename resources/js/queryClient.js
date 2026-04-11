import { QueryClient } from '@tanstack/vue-query';

let sharedQueryClient = null;

export function createLiftTrackerQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            },
        },
    });
}

export function setSharedQueryClient(queryClient) {
    sharedQueryClient = queryClient;
}

export function getSharedQueryClient() {
    if (!sharedQueryClient) {
        throw new Error('Shared query client has not been initialized.');
    }

    return sharedQueryClient;
}

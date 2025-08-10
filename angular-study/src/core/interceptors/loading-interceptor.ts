import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core';
import { finalize, of, tap } from 'rxjs';

type CacheEntry = {
  response: HttpEvent<unknown>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 300000; // Set to 5 minutes

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  // Include the params in generating the cache key
  const generateCacheKey = (url: string, params: HttpParams): string => {
    const paramString = params.keys().map(key => `${key}:${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` : url;
  }

  const invalidateCache = (urlPattern: string) => {
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
  };

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method.includes('POST') && req.url.includes('/friendrequest')) {
    invalidateCache('/friendrequest');
  }

  if ((req.method.includes('POST') || req.method.includes('DELETE')) && req.url.includes('/messages')) {
    invalidateCache('/messages');
  }

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      const isExpired = (Date.now() - cachedResponse.timestamp) > CACHE_DURATION_MS;

      if (!isExpired) {
        return of(cachedResponse.response);
      } else {
        cache.delete(cacheKey);
      }
    }
  }

  busyService.busy();

  return next(req).pipe(
    tap(response => {
      cache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });
    }),
    finalize(() => busyService.idle())
  );
};

export const emptyCache = () => {
  // Empty cache map
  cache.clear();
}

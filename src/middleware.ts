import createMiddleware from 'next-intl/middleware';
import { AllLocales, AppConfig } from './utils/AppConfig';
import type { NextFetchEvent, NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

export default function middleware(request: NextRequest, _event: NextFetchEvent) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

/**
 * `next/link` FUERA DE NEXT, solo para el paquete de Claude Design.
 *
 * Donde Claude Design pinta los componentes no hay router de Next: el
 * `<Link>` de verdad necesita el contexto del App Router para navegar y
 * prefetchear. Aqui se queda en lo que es en el HTML que Next sirve — un
 * `<a href>` — y los componentes del sistema siguen siendo los reales.
 *
 * `build-pkg.mjs` lo sustituye por `next/link` con un alias de esbuild. La
 * app nunca lo ve.
 */
import { forwardRef, type AnchorHTMLAttributes } from 'react';

type Href =
  string | { pathname?: string; hash?: string; query?: Record<string, string> };

function toHref(href: Href): string {
  if (typeof href === 'string') return href;
  const query = href.query
    ? `?${new URLSearchParams(href.query).toString()}`
    : '';
  const hash = href.hash ? `#${href.hash.replace(/^#/, '')}` : '';
  return `${href.pathname ?? ''}${query}${hash}`;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: Href;
  // Props de Next que no tienen sentido sin router: se aceptan y se descartan.
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
  locale?: string | false;
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    prefetch: _prefetch,
    replace: _replace,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    legacyBehavior: _legacyBehavior,
    locale: _locale,
    ...rest
  },
  ref,
) {
  return <a ref={ref} href={toHref(href)} {...rest} />;
});

export default Link;

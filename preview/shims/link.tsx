import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { usePreviewRouter } from "../router";

// Sostituisce next/link: i link interni cambiano pagina nel router in memoria.
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; replace?: boolean };

const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, prefetch: _p, replace, onClick, ...rest }, ref) {
  const { navigate } = usePreviewRouter();
  const external = /^https?:|^mailto:|^tel:/.test(href) || rest.target === "_blank";
  return (
    <a
      ref={ref}
      href={external ? href : `#${href}`}
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (external || e.defaultPrevented) return;
        e.preventDefault();
        navigate(href, replace);
      }}
    />
  );
});

export default Link;

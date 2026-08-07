"use client";

import Link from "next/link";

type FadeLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function FadeLink({
  href,
  children,
  className,
}: FadeLinkProps) {
  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    // Browser doesn't support View Transitions
    if (!("startViewTransition" in document)) return;

    e.preventDefault();

    // @ts-expect-error View Transition API
    document.startViewTransition(() => {
      window.location.href = href;
    });
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
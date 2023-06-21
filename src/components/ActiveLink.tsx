"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

export default function ActiveLink({
  className: classNameProp,
  active: activeProp = true,
  children,
  ...props
}: LinkProps & {
  className?: string;
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  const path = usePathname();
  const active = activeProp && path === props.href.replace(/\?.+/, "");
  const className = `${classNameProp || ""} ${active ? "active" : ""}`;
  return (
    <Link className={className} {...props}>
      {children}
    </Link>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// The part of the header that folds away on narrow screens: on wide ones a row
// of links next to the wordmark, on narrow ones a panel behind a toggle.
//
// Which of the two you get is decided entirely in CSS, so this component only
// tracks whether the menu is open and there is no breakpoint duplicated here
// that could drift from the stylesheet. The panel is a sibling of the button
// rather than nested inside it so that on wide screens it can be dissolved
// with `display: contents`, letting the groups it holds sit directly in the
// header grid.
export default function NavMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Navigating does not unmount the panel, so without this it would stay open
  // over the page you just moved to. Also covers the browser's back button,
  // which no click handler would see.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Past the width the stylesheet stops drawing a panel, the menu is part of
    // the bar again and none of what follows belongs to it. A window dragged
    // wider or a phone turned on its side therefore has to close it, or the
    // page keeps a scroll lock and an unreachable body with nothing on screen
    // to explain either. Read the answer off the panel itself so the width
    // that decides it stays in the stylesheet.
    const onResize = () => {
      const panel = panelRef.current;
      if (panel && getComputedStyle(panel).display === "contents") {
        setOpen(false);
      }
    };
    window.addEventListener("resize", onResize);

    // The menu covers the page, so the page behind it should neither scroll
    // nor be reachable by keyboard while it does.
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    // Locking the page takes its scrollbar away with it, and on the desktop
    // browsers that reserve room for one that would shift the whole page
    // sideways as the menu opens. Handing the width back as padding holds it
    // still. Nothing to do where scrollbars are drawn over the page, which is
    // every touch device.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) {
      const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${padding + scrollbar}px`;
    }

    const concealed = Array.from(
      document.querySelectorAll<HTMLElement>(".main, .footer"),
    );
    concealed.forEach((element) => element.setAttribute("inert", ""));

    // Move into the menu so the first thing after the toggle is a destination,
    // not whatever happened to follow it in the document.
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      concealed.forEach((element) => element.removeAttribute("inert"));
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="nav__toggle"
        // Doubles as the styling hook for the bars becoming a cross, so the
        // open state is never stored in two places.
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="visually-hidden">{open ? "Close menu" : "Menu"}</span>
        <span className="nav__burger" aria-hidden="true" />
      </button>

      <div
        ref={panelRef}
        className="nav__panel"
        id="nav-menu"
        data-open={open}
        // Anything actionable in here navigates, and leaving the menu up over
        // the page it just moved to is wrong.
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a, button")) {
            setOpen(false);
          }
        }}
      >
        {children}
      </div>
    </>
  );
}

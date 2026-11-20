import { RefObject, useLayoutEffect } from "react";

/**
 * Scales an element's text down so it never overflows its container — for
 * display-size names where one long word would otherwise run off a narrow
 * screen. Sets a `--fit` custom property on the element (1 when the text
 * already fits) for its `font-size` to multiply by. The element should be
 * `display: inline-block; max-width: 100%`, so that overflow shows up as
 * `scrollWidth > clientWidth`.
 *
 * Text width scales linearly with font size, so a single measurement at full
 * size gives the exact factor. Re-measures when the container resizes and
 * when `trigger` changes (e.g. when a webfont finishes loading).
 */
export default function useFitText(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  trigger?: unknown,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    const container = el?.parentElement;
    if (!enabled || !el || !container) return;

    const fit = () => {
      el.style.setProperty("--fit", "1");
      const { clientWidth, scrollWidth } = el;
      const scale =
        clientWidth > 0 && scrollWidth > clientWidth
          ? Math.floor((clientWidth / scrollWidth) * 1000) / 1000
          : 1;
      el.style.setProperty("--fit", String(scale));
    };

    // Only width matters; ignore the height changes our own resizing causes.
    let lastWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === lastWidth) return;
      lastWidth = entry.contentRect.width;
      fit();
    });

    fit();
    observer.observe(container);
    return () => observer.disconnect();
  }, [ref, enabled, trigger]);
}

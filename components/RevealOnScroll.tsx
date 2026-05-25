"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article";
};

export default function RevealOnScroll({ children, className, style, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const combined = ["reveal", visible ? "visible" : "", className].filter(Boolean).join(" ");

  return (
    <Tag ref={ref as never} className={combined} style={style}>
      {children}
    </Tag>
  );
}

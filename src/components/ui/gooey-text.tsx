"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let textIndex = 0;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationId: number;

    // Initialize text content
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[0];
      text2Ref.current.textContent = texts[1] || texts[0];
      text1Ref.current.style.opacity = "100%";
      text2Ref.current.style.opacity = "0%";
    }

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        const blur1 = Math.max(0, Math.min(8 / (1 - fraction) - 8, 100));
        const blur2 = Math.max(0, Math.min(8 / fraction - 8, 100));

        text2Ref.current.style.filter = `blur(${blur2}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        text1Ref.current.style.filter = `blur(${blur1}px)`;
        text1Ref.current.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";

        // Swap the text content
        const temp = text1Ref.current.textContent;
        text1Ref.current.textContent = text2Ref.current.textContent;
        text2Ref.current.textContent = temp;

        text1Ref.current.style.opacity = "100%";
        text2Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    function animate() {
      animationId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text2Ref.current) {
            text2Ref.current.textContent = texts[textIndex];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    const timeoutId = setTimeout(() => {
      animate();
    }, 1000); // Start animation after 1 second delay

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-center justify-center"
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-foreground",
            textClassName
          )}
        />
      </div>
    </div>
  );
}
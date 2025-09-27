"use client";

import { Moon, SunDim } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useTheme } from "@/components/providers/theme-provider";

type props = {
  className?: string;
};

export const ThemeToggler = ({ className }: props) => {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  
  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const nextTheme = theme === "light" ? "dark" : "light";
    
    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  const getIcon = () => {
    if (theme === "light") return <SunDim className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      ref={buttonRef} 
      onClick={changeTheme} 
      className={cn("hover:bg-muted", className)}
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
    </Button>
  );
};

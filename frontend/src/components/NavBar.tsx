import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
}

interface NavBarProps {
  items: NavItem[];
  activePath: string;
  className?: string;
}

export function NavBar({ items, activePath, className }: NavBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:bottom-auto md:top-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/85 px-1.5 py-1.5 shadow-lg shadow-primary/10 backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive ? item.isActive(activePath) : activePath === item.url;

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors md:min-w-[6.5rem] md:px-6",
                "text-muted-foreground hover:text-primary-deep",
                isActive && "text-primary-deep",
              )}
              aria-current={isActive ? "page" : undefined}
              title={item.name}
            >
              {isActive && (
                <span className="absolute inset-0 -z-10 rounded-full bg-primary/10">
                  <span className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-full bg-primary md:-top-2 md:rounded-b-none md:rounded-t-full" />
                  <span className="absolute left-1/2 top-0 h-5 w-12 -translate-x-1/2 rounded-full bg-primary/20 blur-md md:-top-3" />
                </span>
              )}
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={19} strokeWidth={2.5} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface CopyToClipboardProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
}

export default function CopyToClipboard({ text, children, className }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        duration: 2000,
        position: "bottom-center",
        style: {
          background: "#1E1E2E",
          color: "#A78BFA",
          fontSize: "12px",
          borderRadius: "12px",
          border: "1px solid rgba(167, 139, 250, 0.2)",
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div 
      onClick={handleCopy}
      className={cn(
        "group relative flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors",
        className
      )}
    >
      {children || <span className="font-mono">{text}</span>}
      <span className={cn(
        "material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity",
        copied ? "text-emerald-400 opacity-100" : "text-primary/60"
      )}>
        {copied ? "check" : "content_copy"}
      </span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-container-highest text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold whitespace-nowrap z-50">
        Click to Copy
      </div>
    </div>
  );
}

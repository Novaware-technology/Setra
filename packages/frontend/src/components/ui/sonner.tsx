"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import "./toaster.css"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={4000}
      closeButton={true}
      richColors={true}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142, 76%, 95%)",
          "--success-text": "hsl(142, 76%, 20%)",
          "--success-border": "hsl(142, 76%, 50%)",
          "--error-bg": "hsl(0, 84%, 95%)",
          "--error-text": "hsl(0, 84%, 20%)",
          "--error-border": "hsl(0, 84%, 50%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          success: "bg-green-50 border-green-500 text-green-900",
          error: "bg-red-50 border-red-500 text-red-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

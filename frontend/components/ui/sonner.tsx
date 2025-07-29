"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
        },
        className: 'group toast group-[.toaster]:bg-white/10 group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:shadow-lg',
      }}
      position="top-right"
      richColors
      {...props}
    />
  )
}

export { Toaster }

interface ScreenProps {
  children: React.ReactNode
}

export function Screen({ children }: ScreenProps) {
  return <div className="mx-[60px] bg-white dark:bg-[#0D0E0E] relative z-10 h-screen flex flex-col">{children}</div>
}

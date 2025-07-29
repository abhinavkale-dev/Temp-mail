interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title = "Temp Mail", description }: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        {title}
      </h1>
      {description && <p className="text-white/70">{description}</p>}
    </header>
  );
} 
interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
      {message}
    </div>
  );
} 
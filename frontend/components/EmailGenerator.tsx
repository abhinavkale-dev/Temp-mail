interface EmailGeneratorProps {
  onGenerate: () => void;
  loading: boolean;
}

export function EmailGenerator({ onGenerate, loading }: EmailGeneratorProps) {
  return (
    <div className="mb-6">
      <button 
        onClick={onGenerate} 
        disabled={loading}
        className="button button--primary w-full"
      >
        {loading ? 'Generating...' : 'Generate Temp Mail'}
      </button>
    </div>
  );
} 
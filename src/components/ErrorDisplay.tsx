interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="w-full rounded-lg border border-red-600 bg-red-900/50 p-4 text-red-200">
      <strong>Error:</strong> {error}
    </div>
  );
}
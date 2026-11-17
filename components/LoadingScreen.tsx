export default function LoadingScreen({
  label = "Memuat halaman...",
}: {
  label?: string;
}) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

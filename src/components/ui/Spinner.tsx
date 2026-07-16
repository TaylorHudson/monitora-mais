export function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="
          h-12 w-12
          animate-spin
          rounded-full
          border-4
          border-[#219653]
          border-t-transparent
        "
      />
    </div>
  );
}

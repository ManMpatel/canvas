export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl p-10 text-white">
        {children}
      </div>
    </div>
  );
}
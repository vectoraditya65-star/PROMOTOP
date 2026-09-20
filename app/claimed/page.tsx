export default function Claimed() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      <h1 className="font-display text-2xl font-900 text-paper">Payment received</h1>
      <p className="mt-3 text-slate">
        Your rank will appear on the leaderboard within a few seconds, once
        Stripe confirms the payment on our end.
      </p>
      <a href="/" className="mt-6 rounded-full bg-ember px-5 py-2 font-semibold text-ink">
        Back to leaderboard
      </a>
    </main>
  );
}

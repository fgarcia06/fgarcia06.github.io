export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-sm text-bone/90 transition-colors duration-200 hover:border-moss/60 hover:text-bone">
      {children}
    </span>
  )
}

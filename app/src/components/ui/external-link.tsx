export function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-9 items-center text-sm text-teal-700 underline underline-offset-2 dark:text-teal-400"
    >
      リンクを開く ↗
    </a>
  );
}

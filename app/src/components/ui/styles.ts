// フォーム部品とボタンの共通スタイル。スマホで押しやすいよう高さ 44px 以上を確保する。

export const inputClass =
  "block w-full min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 aria-invalid:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-1 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-50";

export const buttonClass = {
  primary: `${buttonBase} bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500`,
  secondary: `${buttonBase} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800`,
  danger: `${buttonBase} border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950`,
};

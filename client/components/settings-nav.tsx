import Link from "next/link"

export function SettingsNav() {
  return (
    <nav className="text-sm text-gray-500 grid gap-4 dark:text-gray-400">
      <Link href="#features" className="font-semibold text-gray-900 dark:text-gray-50" prefetch={false}>
        Features
      </Link>
      <Link href="#prompts" prefetch={false}>
        Prompt Templates
      </Link>
      <Link href="#integrations" prefetch={false}>
        Integrations
      </Link>
    </nav>
  )
} 
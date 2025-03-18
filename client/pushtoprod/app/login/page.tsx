import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity">
            <Image src="/penlogo.svg" alt="Logo" width={24} height={24} />
            PushToProd.ai
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/penlogo.svg"
          alt="Background Logo"
          fill
          priority
          className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
          quality={90}
        />
      </div>
    </div>
  )
}

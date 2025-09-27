import { LoginForm } from "@/components/forms"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { VeilAnimation } from "@/components/ui/veil-animation"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative">
      <VeilAnimation intensity="normal" position="background" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggler className="h-9 w-9" />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl z-10 relative">
        <LoginForm />
      </div>
    </div>
  )
}

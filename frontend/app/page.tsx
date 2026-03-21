import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BenefitsSection } from "@/components/benefits-section"
import { MapSection } from "@/components/map-section"
import { RegistrationForm } from "@/components/registration-form"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <MapSection />
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  )
}

import { HeroSection } from '@/components/hero-section'
// import { LogoCloud } from '@/components/logo-cloud'
import { FeatureSection } from '@/components/feature-section'
// import { SocialProof } from '@/components/social-proof'
import { CTA } from '@/components/cta'
import { FAQ } from '@/components/faq'
import { PricingSection } from '@/components/pricing'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      {/* <LogoCloud /> */}
      <FeatureSection />
      {/* <SocialProof /> */}
      <CTA />
      <FAQ />
      <PricingSection />
      <Footer />
    </>
  )
}

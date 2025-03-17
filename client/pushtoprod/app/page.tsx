import { HeroSection } from '@/components/hero-section'
import { LogoCloud } from '@/components/logo-cloud'
import { FeatureSection } from '@/components/feature-section'
import { SocialProof } from '@/components/social-proof'
import { CTA } from '@/components/cta'
import { FAQ } from '@/components/faq'
import { PricingSection } from '@/components/pricing'

export default function Home() {
  return (
    <>
      <HeroSection />
      <LogoCloud />
      <FeatureSection />
      <SocialProof />
      <CTA />
      <FAQ />
      <PricingSection />
    </>
  )
}

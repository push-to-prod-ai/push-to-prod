import { HeroSection } from './home/hero-section'
import { LogoCloud } from './home/logo-cloud'
import { FeatureSection } from './home/feature-section'
import { SocialProof } from './home/social-proof'
import { CTA } from './home/cta'
import { FAQ } from './home/faq'
import { PricingSection } from './home/pricing'

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

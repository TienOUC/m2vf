import { HeroBadge } from './HeroBadge'
import { HeroTitle } from './HeroTitle'
import { HeroCTA } from './HeroCTA'
import { HeroVisual } from './HeroVisual'

export function HeroSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-12 min-h-[calc(100vh-70px)] flex flex-col">
      <div className="flex flex-col items-center text-center">
        <HeroBadge />
        <HeroTitle />
        <HeroCTA />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
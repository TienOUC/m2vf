
'use client'

import { HeroSection } from '@/components/home'
import Navbar from '@/components/layout/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <HeroSection />
    </div>
  )
}

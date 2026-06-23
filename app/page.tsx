import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import About from '@/components/sections/About'
import Notes from '@/components/sections/Notes'
import ReachOut from '@/components/sections/ReachOut'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Work />
      <About />
      <Notes />
      <ReachOut />
    </main>
  )
}

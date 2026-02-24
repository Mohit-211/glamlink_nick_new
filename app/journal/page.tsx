import BlogGrid from '@/blogs/BlogGrid'
import CategoryNav from '@/blogs/CategoryNav'
import HeroSection from '@/blogs/HeroSection'
const Journal = () => {
  return (
      <div className="min-h-screen flex flex-col bg-background">

    <main className="flex-1">
      <HeroSection />
      <CategoryNav />
      <BlogGrid />
    </main>
      </div>
  )
}
export default Journal
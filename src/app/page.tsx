'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Video, getVideos } from '@/lib/database'
import { SparklesCore } from '@/components/ui/sparkles-core'
import VideoPlayerModal from '@/components/VideoPlayerModal'
import VideoForm from '@/components/VideoForm'
import DigitalSerenityEffects from '@/components/DigitalSerenityEffects'
import { toast } from 'sonner'
import { testFirebaseConnection } from '@/lib/firebase-test'
import Link from 'next/link'

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    'All', 'Music', 'Podcasts', 'Sports', 'Tech News', 'Education',
    'Entertainment', 'Lifestyle', 'Documentaries', 'Interviews', 'Comedy', 'Vlogs'
  ]

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          console.error('Error signing in anonymously:', error)
          toast.error('Authentication failed')
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Load videos on component mount and auth change
  useEffect(() => {
    if (user) {
      loadVideos()
    }
  }, [user])

  // Filter videos based on search and category
  useEffect(() => {
    filterVideos()
  }, [videos, searchTerm, selectedCategory])

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const videoList = await getVideos()
      setVideos(videoList)
    } catch (error) {
      console.error('Error loading videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterVideos = async () => {
    let filtered = videos

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = videos.filter(video => video.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredVideos(filtered)
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    setIsPlayerModalOpen(true)
  }

  const handleAddVideo = () => {
    setEditingVideo(null)
    setIsFormModalOpen(true)
  }

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    setIsFormModalOpen(true)
    setIsPlayerModalOpen(false)
  }

  const handleVideoSaved = () => {
    loadVideos() // Reload videos after save
  }

  const handleVideoDeleted = () => {
    loadVideos() // Reload videos after delete
  }

  const testConnection = async () => {
    console.log('Testing Firebase connection manually...')
    const result = await testFirebaseConnection()
    if (result.success) {
      toast.success(`Connected! Found ${result.count} videos in Firebase`)
      console.log('Firebase test result:', result)
    } else {
      toast.error('Firebase connection failed')
      console.error('Firebase test error:', result.error)
    }
  }

  const getThumbnailUrl = (video: Video) => {
    if (video.thumbnail) return video.thumbnail

    // Extract YouTube thumbnail
    const videoId = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1]
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    return null
  }

  return (
    <div className="min-h-screen relative bg-white">
      {/* SparklesCore Background */}
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={120}
          className="w-full h-full"
          particleColor="#000000"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-gray-100/40 to-white/70 pointer-events-none" />

      {/* Digital Serenity Effects */}
      <DigitalSerenityEffects />

      {/* Header */}
      <header className="relative z-10 p-4 animate-blur-in">
        <div className="container mx-auto">
          <nav className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg transition-all"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center py-4 sm:py-8 mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-1" style={{ color: '#000000' }}>
            Urban Directory
          </h1>
          <p className="text-lg sm:text-xl mb-4 max-w-2xl mx-auto px-4" style={{ color: '#000000' }}>
            Find the full videos of the clips posted on the page
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-2 sm:mb-4 px-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-white/80 backdrop-blur-lg border border-blue-600/30 text-black placeholder:text-gray-500 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_20px_rgba(30,64,175,0.3)] transition-all duration-300"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-1 sm:mb-3 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex items-center gap-1 bg-white/20 border border-gray-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg overflow-x-auto scrollbar-hide">
              {categories.map((category) => {
                const isActive = selectedCategory === category
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors text-black/80 hover:text-blue-600 whitespace-nowrap flex-shrink-0"
                  >
                    {category}
                    {isActive && (
                      <motion.div
                        layoutId="categoryLamp"
                        className="absolute inset-0 w-full bg-blue-600/10 rounded-full -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="relative z-10 px-1 sm:px-4 animate-fade-in">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="text-black text-xl">Loading videos...</div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="bg-white/50 border border-gray-200 hover:bg-white/70 transition-all cursor-pointer overflow-hidden"
                onClick={() => handleVideoClick(video)}
              >
                <CardHeader className="p-0">
                  {getThumbnailUrl(video) ? (
                    <img
                      src={getThumbnailUrl(video)!}
                      alt={video.title}
                      className="aspect-video w-full object-cover bg-black opacity-100"
                    />
                  ) : (
                    <div className="aspect-video bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">🎬</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="px-1 py-0.5">
                  <CardTitle className="text-black text-xs font-medium line-clamp-1 word-animate" data-delay="0">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-black text-xs line-clamp-1">
                    {video.description}
                  </CardDescription>
                  <div className="flex justify-end">
                    <span className="text-black text-xs">
                      {video.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-semibold text-black mb-2">
                {searchTerm || selectedCategory !== 'All' ? 'No videos found' : 'No videos yet'}
              </h3>
              <p className="text-black mb-6">
                {searchTerm || selectedCategory !== 'All'
                  ? 'Try adjusting your search or category filter'
                  : 'Be the first to add a video to the directory!'}
              </p>
              <Button onClick={handleAddVideo} className="bg-blue-600 hover:bg-blue-700">
                Add First Video
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        open={isPlayerModalOpen}
        onOpenChange={setIsPlayerModalOpen}
        onVideoDeleted={handleVideoDeleted}
        onEditVideo={handleEditVideo}
      />

      {/* Video Form Modal */}
      <VideoForm
        video={editingVideo}
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onVideoSaved={handleVideoSaved}
      />


      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Video, getVideos, deleteVideo } from '@/lib/database'
import { SparklesCore } from '@/components/ui/sparkles-core'
import VideoPlayerModal from '@/components/VideoPlayerModal'
import VideoForm from '@/components/VideoForm'
import DigitalSerenityEffects from '@/components/DigitalSerenityEffects'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  // Filter videos based on search
  useEffect(() => {
    filterVideos()
  }, [videos, searchTerm])

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

  const handleDeleteVideo = async (video: Video) => {
    if (!video.id) return

    const confirmed = window.confirm(`Are you sure you want to delete "${video.title}"?`)
    if (!confirmed) return

    try {
      await deleteVideo(video.id)
      toast.success('Video deleted successfully')
      loadVideos()
    } catch (error) {
      toast.error('Failed to delete video')
      console.error('Error deleting video:', error)
    }
  }

  const handleVideoSaved = () => {
    loadVideos() // Reload videos after save
  }

  const handleVideoDeleted = () => {
    loadVideos() // Reload videos after delete
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
          id="admin-particles"
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
              <Link href="/">
                <Button
                  variant="outline"
                  className="bg-gray-100 border-gray-300 text-black hover:bg-gray-200"
                >
                  ← Back to Site
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center py-4 sm:py-8 mb-4">
          <h1 className="text-black text-3xl sm:text-4xl md:text-6xl font-bold mb-1">
            Admin Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-black mb-4 max-w-2xl mx-auto px-4">
            Manage your video directory
          </p>

          {/* Search Bar with Add Video Button */}
          <div className="max-w-2xl mx-auto mb-2 sm:mb-4 px-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search videos to manage..."
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
            <div className="flex justify-center mt-4 relative z-50">
              <Button
                onClick={handleAddVideo}
                className="bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg transition-all relative z-50 pointer-events-auto"
              >
                Add Video
              </Button>
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
                <CardContent className="px-1 py-0">
                  <CardTitle className="text-black text-xs font-medium line-clamp-1 word-animate mb-0" data-delay="0">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-black text-xs line-clamp-1 mb-0">
                    {video.description}
                  </CardDescription>
                  <div className="flex justify-end mb-0">
                    <span className="text-black text-xs">
                      {video.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex gap-0.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => handleEditVideo(video)}
                      size="sm"
                      className="flex-1 bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg text-xs py-0.5 h-5"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteVideo(video)}
                      size="sm"
                      className="flex-1 bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg text-xs py-0.5 h-5"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-black mb-2">
                {searchTerm ? 'No videos found' : 'No videos yet'}
              </h3>
              <p className="text-black mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Add your first video to get started!'}
              </p>
              <Button onClick={handleAddVideo} className="bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg transition-all">
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
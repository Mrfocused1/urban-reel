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
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2 text-decoration-animate">
                <span className="word-animate" data-delay="0">Admin</span>
                <span className="word-animate" data-delay="200"> </span>
                <span className="word-animate" data-delay="400">Dashboard</span>
              </h1>
              <p className="text-black">
                <span className="word-animate" data-delay="600">Manage</span>
                <span className="word-animate" data-delay="700">your</span>
                <span className="word-animate" data-delay="800">video</span>
                <span className="word-animate" data-delay="900">directory</span>
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="bg-gray-100 border-gray-300 text-black hover:bg-gray-200"
                >
                  ← Back to Site
                </Button>
              </Link>

              <Button
                onClick={handleAddVideo}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Video
              </Button>
            </div>
          </div>

          {/* Admin Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search videos to manage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 border-gray-300 text-black placeholder:text-gray-500 text-lg py-6"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/90 border-gray-300 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{videos.length}</div>
                  <div className="text-black">Total Videos</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 border-gray-300 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{filteredVideos.length}</div>
                  <div className="text-black">Filtered Results</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 border-gray-300 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{user ? 'Online' : 'Offline'}</div>
                  <div className="text-black">Status</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-black text-xl">Loading videos...</div>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="bg-white/50 border border-gray-200 hover:bg-white/70 transition-all"
              >
                <CardHeader className="p-0">
                  {getThumbnailUrl(video) ? (
                    <img
                      src={getThumbnailUrl(video)!}
                      alt={video.title}
                      className="aspect-video w-full object-cover rounded-t-lg bg-black opacity-100 cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    />
                  ) : (
                    <div
                      className="aspect-video bg-gray-700 rounded-t-lg flex items-center justify-center cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    >
                      <span className="text-gray-400">🎬</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-1">
                  <CardTitle className="text-black text-sm mb-0.5 line-clamp-1 word-animate" data-delay="0">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-black mb-1 line-clamp-1">
                    {video.description}
                  </CardDescription>
                  <div className="flex justify-end mb-1">
                    <span className="text-black text-sm">
                      {video.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEditVideo(video)}
                      size="sm"
                      className="flex-1 bg-blue-100 border-blue-500 text-black hover:bg-blue-200"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteVideo(video)}
                      size="sm"
                      variant="destructive"
                      className="flex-1 bg-red-100 border-red-500 text-black hover:bg-red-200"
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
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold text-black mb-2">
              {searchTerm ? 'No videos found' : 'No videos yet'}
            </h3>
            <p className="text-black mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Add your first video to get started!'}
            </p>
            <Button onClick={handleAddVideo} className="bg-blue-600 hover:bg-blue-700">
              Add First Video
            </Button>
          </div>
        )}
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
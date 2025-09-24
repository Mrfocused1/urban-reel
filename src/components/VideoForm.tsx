'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Video, addVideo, updateVideo, getYouTubeVideoData, extractVideoId } from '@/lib/database'
import { toast } from 'sonner'

interface VideoFormProps {
  video?: Video | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVideoSaved?: () => void
}

const categories = [
  'Music', 'Podcasts', 'Sports', 'Tech News', 'Education',
  'Entertainment', 'Lifestyle', 'Documentaries', 'Interviews', 'Comedy', 'Vlogs'
]

export default function VideoForm({ video, open, onOpenChange, onVideoSaved }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: '',
    tags: [] as string[],
    thumbnail: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingYouTube, setIsLoadingYouTube] = useState(false)

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        category: video.category || '',
        tags: video.tags || [],
        thumbnail: video.thumbnail || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        category: '',
        tags: [],
        thumbnail: ''
      })
    }
  }, [video])

  const handleYouTubeUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, videoUrl: url }))

    const videoId = extractVideoId(url)
    if (videoId) {
      setIsLoadingYouTube(true)
      try {
        const youtubeData = await getYouTubeVideoData(videoId)
        if (youtubeData) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || youtubeData.title,
            description: prev.description || youtubeData.description.slice(0, 500),
            thumbnail: youtubeData.thumbnail
          }))
          toast.success('YouTube video data loaded automatically')
        }
      } catch (error) {
        console.error('Error loading YouTube data:', error)
      } finally {
        setIsLoadingYouTube(false)
      }
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.videoUrl || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      if (video?.id) {
        // Update existing video
        await updateVideo(video.id, formData)
        toast.success('Video updated successfully')
      } else {
        // Add new video
        await addVideo(formData)
        toast.success('Video added successfully')
      }
      onVideoSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(video?.id ? 'Failed to update video' : 'Failed to add video')
      console.error('Error saving video:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black text-2xl">
            {video ? 'Edit Video' : 'Add New Video'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {video ? 'Update video information' : 'Add a new video to the directory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-black">
              Video URL * {isLoadingYouTube && <span className="text-blue-600">(Loading YouTube data...)</span>}
            </Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => handleYouTubeUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-white border-gray-300 text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-black">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              className="bg-white border-gray-300 text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              className="bg-white border-gray-300 text-black placeholder:text-gray-500 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-black">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                category: value,
                tags: value ? [value] : []
              }))}
            >
              <SelectTrigger className="bg-white border-gray-300 text-black placeholder:text-gray-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-black">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-black">Selected Category as Tag</Label>
            <div className="flex flex-wrap gap-2">
              {formData.category && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 border-blue-300 text-blue-700"
                >
                  {formData.category}
                </Badge>
              )}
              {!formData.category && (
                <p className="text-gray-500 text-sm">Select a category above to automatically set the tag</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingYouTube}
              className="bg-white/20 border border-gray-200 text-black hover:bg-white/40 backdrop-blur-lg"
            >
              {isLoading ? 'Saving...' : video ? 'Update Video' : 'Add Video'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
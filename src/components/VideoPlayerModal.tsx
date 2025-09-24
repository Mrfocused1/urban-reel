'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, deleteVideo } from '@/lib/database'
import { toast } from 'sonner'

interface VideoPlayerModalProps {
  video: Video | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVideoDeleted?: () => void
  onEditVideo?: (video: Video) => void
}

export default function VideoPlayerModal({
  video,
  open,
  onOpenChange,
  onVideoDeleted,
  onEditVideo
}: VideoPlayerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!video) return null

  const handleDelete = async () => {
    if (!video.id) return

    setIsDeleting(true)
    try {
      await deleteVideo(video.id)
      toast.success('Video deleted successfully')
      onVideoDeleted?.()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete video')
      console.error('Error deleting video:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URL to embed URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1]
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{video.title}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Watch and manage this video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video w-full">
            <iframe
              src={getEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
              frameBorder="0"
            />
          </div>

          {/* Video Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{video.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-600/20 border-blue-500 text-blue-200">
                {video.category}
              </Badge>
              {video.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-purple-600/20 border-purple-500 text-purple-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {video.viewCount && (
              <div className="text-gray-400 text-sm">
                {video.viewCount.toLocaleString()} views
              </div>
            )}

            {video.createdAt && (
              <div className="text-gray-400 text-sm">
                Added {video.createdAt.toDate().toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-3">
              <Button
                onClick={() => onEditVideo?.(video)}
                variant="outline"
                className="bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30"
              >
                Edit Video
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Video'}
              </Button>
            </div>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
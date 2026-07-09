import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Trash2, Lock, Unlock, Move, FolderOutput, 
  ChevronDown, ChevronUp, X, Check, Star, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface VideoManagementToolsProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    is_locked?: boolean;
    is_premium?: boolean;
    is_prerequisite?: boolean;
    module_index?: number;
  };
  playlists?: Array<{ id: string; title: string }>;
  modules?: Array<{ id: string; title: string; order_index: number }>;
  onUpdate: (updates: Partial<VideoManagementToolsProps['video']>) => Promise<void>;
  onDelete: () => Promise<void>;
  onMoveToModule: (moduleId: string) => Promise<void>;
}

export function VideoManagementTools({
  video,
  playlists = [],
  modules = [],
  onUpdate,
  onDelete,
  onMoveToModule
}: VideoManagementToolsProps) {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  
  const [editTitle, setEditTitle] = useState(video.title);
  const [editDescription, setEditDescription] = useState(video.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate({
        title: editTitle,
        description: editDescription
      });
      setIsEditOpen(false);
      toast({ title: 'Video updated successfully' });
    } catch (error) {
      toast({ title: 'Failed to update video', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
      setIsDeleteOpen(false);
      toast({ title: 'Video deleted successfully', variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Failed to delete video', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (locked: boolean) => {
    try {
      await onUpdate({ is_locked: locked });
      toast({ title: locked ? 'Video locked' : 'Video unlocked' });
    } catch (error) {
      toast({ title: 'Failed to update lock status', variant: 'destructive' });
    }
  };

  const handleTogglePremium = async (premium: boolean) => {
    try {
      await onUpdate({ is_premium: premium });
      toast({ title: premium ? 'Video marked as premium' : 'Premium removed' });
    } catch (error) {
      toast({ title: 'Failed to update premium status', variant: 'destructive' });
    }
  };

  const handleTogglePrerequisite = async (prereq: boolean) => {
    try {
      await onUpdate({ is_prerequisite: prereq });
      toast({ title: prereq ? 'Video set as prerequisite' : 'Prerequisite removed' });
    } catch (error) {
      toast({ title: 'Failed to update prerequisite', variant: 'destructive' });
    }
  };

  const handleMove = async (moduleId: string) => {
    try {
      await onMoveToModule(moduleId);
      setIsMoveOpen(false);
      toast({ title: 'Video moved successfully' });
    } catch (error) {
      toast({ title: 'Failed to move video', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video title and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter video title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter video description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting || !editTitle.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock/Premium/Prerequisite Menu */}
      <Dialog open={isLockedOpen} onOpenChange={setIsLockedOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            {video.is_locked ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{video.is_locked ? 'Locked' : 'Access'}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Video Access Settings</DialogTitle>
            <DialogDescription>
              Control who can access this video.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Locked</p>
                  <p className="text-xs text-muted-foreground">Restrict access to this video</p>
                </div>
              </div>
              <Switch
                checked={video.is_locked || false}
                onCheckedChange={handleToggleLock}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-500/10">
                  <Star className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Premium</p>
                  <p className="text-xs text-muted-foreground">Only for premium subscribers</p>
                </div>
              </div>
              <Switch
                checked={video.is_premium || false}
                onCheckedChange={handleTogglePremium}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Key className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Prerequisite</p>
                  <p className="text-xs text-muted-foreground">Must watch before continuing</p>
                </div>
              </div>
              <Switch
                checked={video.is_prerequisite || false}
                onCheckedChange={handleTogglePrerequisite}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLockedOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Module Dialog */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Move className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Move</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Move to Module</DialogTitle>
            <DialogDescription>
              Select a module to move this video to.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[200px] my-4">
            <div className="space-y-2">
              {modules.length > 0 ? (
                modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleMove(module.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <FolderOutput className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{module.title}</p>
                      <p className="text-xs text-muted-foreground">Module {module.order_index + 1}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOutput className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No modules available</p>
                  <p className="text-xs">Create modules first to move videos</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{video.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Badges */}
      <div className="flex items-center gap-1 ml-2">
        {video.is_locked && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Lock className="w-2.5 h-2.5" />
            Locked
          </Badge>
        )}
        {video.is_premium && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Star className="w-2.5 h-2.5" />
            Premium
          </Badge>
        )}
        {video.is_prerequisite && (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
            <Key className="w-2.5 h-2.5" />
            Prereq
          </Badge>
        )}
      </div>
    </div>
  );
}

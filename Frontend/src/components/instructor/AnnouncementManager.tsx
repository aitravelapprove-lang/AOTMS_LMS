import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useInstructorData";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Bell, Trash2, Pin, Megaphone, Users } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";

interface Batch {
  id: string;
  batch_name: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  allowed_batches?: string[];
}

interface AnnouncementManagerProps {
  courseId: string;
}

export function AnnouncementManager({ courseId }: AnnouncementManagerProps) {
  const { user } = useAuth();
  const { data: announcements = [], isLoading } = useAnnouncements(courseId) as { data: Announcement[], isLoading: boolean };
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    is_pinned: false,
    allowed_batches: [] as string[]
  });

  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = (await fetchWithAuth(`/batches?course_id=${courseId}`)) as Batch[];
        setBatches(data || []);
      } catch (e) {
        console.error("Failed to load batches", e);
      }
    };
    if (courseId) loadBatches();
  }, [courseId]);

  const handleCreate = async () => {
    if (
      !newAnnouncement.title.trim() ||
      !newAnnouncement.content.trim() ||
      !user?.id
    )
      return;
    await createAnnouncement.mutateAsync({
      course_id: courseId,
      instructor_id: user.id,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      is_pinned: newAnnouncement.is_pinned,
      allowed_batches: newAnnouncement.allowed_batches
    });
    setNewAnnouncement({ title: "", content: "", is_pinned: false, allowed_batches: [] });
    setIsAddOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement.mutateAsync({ id, courseId });
  };

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return (
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading announcements...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Announcements
            </CardTitle>
            <CardDescription>Post updates for your students</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
                <DialogDescription>
                  Share updates with your students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input
                    id="announcement-title"
                    placeholder="Announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-content">Content</Label>
                  <Textarea
                    id="announcement-content"
                    placeholder="Write your announcement..."
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="pinned">Pin this announcement</Label>
                  </div>
                  <Switch
                    id="pinned"
                    checked={newAnnouncement.is_pinned}
                    onCheckedChange={(checked) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        is_pinned: checked,
                      })
                    }
                  />
                </div>

                {/* Batch Selection */}
                {batches.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Target Batches (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {batches.map((batch) => {
                        const isSelected = newAnnouncement.allowed_batches.includes(batch.id);
                        return (
                          <Badge
                            key={batch.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer h-9 px-3 rounded-lg font-bold text-[10px] uppercase transition-all ${
                              isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setNewAnnouncement({ ...newAnnouncement, allowed_batches: newAnnouncement.allowed_batches.filter(id => id !== batch.id) });
                              } else {
                                setNewAnnouncement({ ...newAnnouncement, allowed_batches: [...newAnnouncement.allowed_batches, batch.id] });
                              }
                            }}
                          >
                            {batch.batch_name}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 italic">No batches selected = visible to all students.</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createAnnouncement.isPending}
                >
                  {createAnnouncement.isPending
                    ? "Posting..."
                    : "Post Announcement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet.</p>
            <p className="text-sm">
              Post updates to keep your students informed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border ${
                  announcement.is_pinned
                    ? "border-accent bg-accent/5"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.is_pinned && (
                        <Pin className="h-4 w-4 text-accent" />
                      )}
                      <h4 className="font-medium">{announcement.title}</h4>
                      {announcement.is_pinned && (
                        <Badge
                          variant="outline"
                          className="text-accent border-accent"
                        >
                          Pinned
                        </Badge>
                      )}
                      {announcement.allowed_batches && announcement.allowed_batches.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" /> {announcement.allowed_batches.length} Batches
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Posted{" "}
                      {announcement.created_at &&
                        formatDistanceToNow(new Date(announcement.created_at), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
                    disabled={deleteAnnouncement.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
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
  useTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from "@/hooks/useInstructorData";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  GripVertical,
  Clock,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface TopicManagerProps {
  courseId: string;
}

export function TopicManager({ courseId }: TopicManagerProps) {
  const { data: topics = [], isLoading } = useTopics(courseId);
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
  });

  const handleCreate = async () => {
    if (!newTopic.title.trim()) return;
    await createTopic.mutateAsync({
      course_id: courseId,
      title: newTopic.title,
      description: newTopic.description || null,
      order_index: topics.length,
      duration_minutes: newTopic.duration_minutes,
    });
    setNewTopic({ title: "", description: "", duration_minutes: 30 });
    setIsAddOpen(false);
  };

  const toggleComplete = async (topic: (typeof topics)[0]) => {
    await updateTopic.mutateAsync({
      id: topic.id,
      course_id: courseId,
      is_completed: !topic.is_completed,
      completed_at: !topic.is_completed ? new Date().toISOString() : null,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTopic.mutateAsync({ id, courseId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading topics...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Topic Completion
            </CardTitle>
            <CardDescription>Track and manage course topics</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Topic</DialogTitle>
                <DialogDescription>
                  Create a new topic for your course
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Topic title"
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Topic description (optional)"
                    value={newTopic.description}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={newTopic.duration_minutes}
                    onChange={(e) =>
                      setNewTopic({
                        ...newTopic,
                        duration_minutes: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createTopic.isPending}>
                  {createTopic.isPending ? "Creating..." : "Create Topic"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No topics yet. Add your first topic to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, idx) => (
              <div
                key={topic.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  topic.is_completed
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                    : "bg-muted/50"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {idx + 1}
                </span>
                <button
                  onClick={() => toggleComplete(topic)}
                  className="flex-shrink-0"
                  disabled={updateTopic.isPending}
                >
                  {topic.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium ${topic.is_completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {topic.title}
                  </h4>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {topic.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {topic.duration_minutes} min
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(topic.id)}
                  disabled={deleteTopic.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {topics.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {topics.filter((t) => t.is_completed).length} / {topics.length}{" "}
                completed
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${(topics.filter((t) => t.is_completed).length / topics.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

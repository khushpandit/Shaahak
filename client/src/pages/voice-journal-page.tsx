import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, Pause, Play, Save, Trash, Send, Tag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VoiceJournal } from "@shared/schema";
import { format } from "date-fns";

export default function VoiceJournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("journal");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch voice journals
  const { data: journals = [], isLoading } = useQuery({
    queryKey: ["/api/voice-journals"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create a new journal entry
  const createJournalMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/voice-journals", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Failed to create voice journal");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-journals"] });
      toast({
        title: "Success",
        description: "Voice journal entry created",
      });
      // Reset the form
      setAudioBlob(null);
      setAudioUrl(null);
      setTitle("");
      setRecordingTime(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a journal entry
  const deleteJournalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/voice-journals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-journals"] });
      toast({
        title: "Success",
        description: "Voice journal entry deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please make sure you've granted permission.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Toggle play/pause of the recorded audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Format the recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio end event
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  // Save the recording
  const saveRecording = async () => {
    if (!audioBlob) return;
    
    const formData = new FormData();
    formData.append("title", title || "Voice Journal Entry");
    formData.append("duration", recordingTime.toString());
    formData.append("category", category);
    formData.append("audio", audioBlob, "recording.webm");
    
    createJournalMutation.mutate(formData);
  };

  // Delete a journal entry
  const deleteJournal = (id: number) => {
    if (confirm("Are you sure you want to delete this voice journal entry?")) {
      deleteJournalMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Voice Journal</h1>
      <p className="text-muted-foreground">Record your thoughts and emotions for AI-powered analysis</p>
      
      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        src={audioUrl || ""} 
        onEnded={handleAudioEnd} 
        className="hidden" 
      />
      
      {/* Recording controls */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Record a new entry</CardTitle>
          <CardDescription>Express your thoughts and feelings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {isRecording ? (
              <Button 
                onClick={stopRecording} 
                className="bg-red-500 hover:bg-red-600" 
                size="lg"
              >
                <Pause className="mr-2 h-5 w-5" />
                Stop Recording ({formatTime(recordingTime)})
              </Button>
            ) : (
              <Button 
                onClick={startRecording} 
                className="bg-purple-600 hover:bg-purple-700" 
                size="lg"
                disabled={!!audioBlob}
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            )}
            
            {audioUrl && (
              <Button 
                onClick={togglePlayback} 
                variant="outline" 
                size="icon"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            )}
          </div>
          
          {audioBlob && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Entry title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Recording duration: {formatTime(recordingTime)}
              </div>
            </div>
          )}
        </CardContent>
        
        {audioBlob && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl(null);
                setTitle("");
                setRecordingTime(0);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <Button onClick={saveRecording} disabled={createJournalMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createJournalMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Journal Entries */}
      <div className="space-y-4 mt-8">
        <h2 className="text-2xl font-bold">Your Journal Entries</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Loading your journal entries...</div>
        ) : journals.length === 0 ? (
          <Alert>
            <AlertTitle>No journal entries yet</AlertTitle>
            <AlertDescription>
              Start by recording your first voice journal entry above.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {journals.map((journal: VoiceJournal) => (
              <Card key={journal.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{journal.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteJournal(journal.id)}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <CardDescription>
                    {format(new Date(journal.date), 'MMM d, yyyy')} • {formatTime(journal.duration)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{journal.category}</Badge>
                    {journal.tags && journal.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  
                  {journal.transcription && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {journal.transcription}
                    </p>
                  )}
                  
                  {journal.sentiment && (
                    <div className="text-xs text-muted-foreground">
                      Sentiment: {typeof journal.sentiment === 'object' ? 
                        JSON.stringify(journal.sentiment).substring(0, 50) + '...' :
                        String(journal.sentiment)}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline" className="w-auto">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to handle API requests
function getQueryFn({ on401 }: { on401: "throw" }) {
  return async () => {
    const res = await fetch("/api/voice-journals");
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      throw new Error("Failed to fetch voice journals");
    }
    return await res.json();
  };
}
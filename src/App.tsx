import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Wallet, 
  Compass, 
  Sparkles, 
  Download, 
  Loader2,
  ArrowRight,
  Globe,
  Users,
  Shield,
  Trophy,
  Package,
  WifiOff,
  Brain,
  CloudRain,
  Car,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  FileCode
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateItinerary, adaptItinerary, ItineraryRequest, AdaptationRequest } from "./services/gemini";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // New Itinerary Form State
  const [formData, setFormData] = useState<ItineraryRequest>({
    destination: "",
    days: "3",
    budget: "",
    interests: "",
    travelStyle: "Solo",
    groupInterests: [],
    features: {
      reasoning: true,
      safety: false,
      gamification: false,
      packingList: false,
      offlineMode: false,
    }
  });

  // Adaptation Form State
  const [adaptationData, setAdaptationData] = useState<AdaptationRequest>({
    existingItinerary: "",
    weatherData: "",
    trafficInfo: "",
    delays: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: keyof NonNullable<ItineraryRequest["features"]>) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features?.[feature]
      }
    }));
  };

  const addGroupInterest = () => {
    setFormData(prev => ({
      ...prev,
      groupInterests: [...(prev.groupInterests || []), ""]
    }));
  };

  const updateGroupInterest = (index: number, value: string) => {
    const newInterests = [...(formData.groupInterests || [])];
    newInterests[index] = value;
    setFormData(prev => ({ ...prev, groupInterests: newInterests }));
  };

  const removeGroupInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groupInterests: (prev.groupInterests || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const result = await generateItinerary(formData);
      setItinerary(result || "No itinerary generated.");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdaptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const result = await adaptItinerary(adaptationData);
      setItinerary(result || "No adaptation generated.");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'word' | 'md') => {
    if (!itinerary) return;
    
    const fileName = `voyager-itinerary-${formData.destination.replace(/\s+/g, "-").toLowerCase()}`;

    if (format === 'md') {
      const blob = new Blob([itinerary], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'word') {
      const element = document.getElementById('itinerary-content');
      if (!element) return;
      
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Voyager Itinerary</title><style>body { font-family: sans-serif; color: #333; } .markdown-body { padding: 20px; }</style></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + element.innerHTML + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 text-foreground">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
            alt="Travel background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>

        <div className="max-w-7xl relative z-10 px-4 text-center mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary px-4 py-1 rounded-full bg-primary/5">
              <Sparkles className="w-3 h-3 mr-2" />
              Intelligent Travel Suite
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
              Voyager <span className="text-primary italic">Pro</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
              The ultimate AI travel companion. Plan, adapt, and explore with human-like reasoning and real-time awareness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 -mt-20 relative z-20">
        <Tabs defaultValue="new" className="w-full flex flex-col items-center">
          <TabsList className="bg-zinc-900/90 border border-zinc-800 p-1 rounded-full h-12 shadow-2xl mb-6">
            <TabsTrigger value="new" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              New Itinerary
            </TabsTrigger>
            <TabsTrigger value="adapt" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Adapt Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="w-full max-w-2xl mt-0 outline-none">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <Compass className="w-5 h-5 text-primary" />
                    Smart Planner
                  </CardTitle>
                  <CardDescription>Configure your personalized journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Destination</Label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-3 w-4 h-4 text-zinc-500" />
                          <Input 
                            name="destination"
                            placeholder="e.g. Paris, France" 
                            className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white"
                            value={formData.destination}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Travel Style</Label>
                        <Select 
                          value={formData.travelStyle} 
                          onValueChange={(v: any) => setFormData(p => ({ ...p, travelStyle: v }))}
                        >
                          <SelectTrigger className="h-11 bg-zinc-800/50 border-zinc-700 text-white">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="Solo">Solo Explorer</SelectItem>
                            <SelectItem value="Group">Group Adventure</SelectItem>
                            <SelectItem value="Family">Family Vacation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Duration (Days)</Label>
                        <div className="relative flex items-center">
                          <Calendar className="absolute left-3 w-4 h-4 text-zinc-500" />
                          <Input 
                            name="days"
                            type="number"
                            className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white"
                            value={formData.days}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Budget</Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-sm font-medium text-zinc-500 select-none">Rs.</span>
                          <Input 
                            name="budget"
                            placeholder="50,000" 
                            className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white"
                            value={formData.budget}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Main Interests</Label>
                      <Textarea 
                        name="interests"
                        placeholder="What do you love? (e.g. Art, Food, Hiking)" 
                        className="bg-zinc-800/50 border-zinc-700 min-h-[80px] text-white"
                        value={formData.interests}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {formData.travelStyle === "Group" && (
                      <div className="space-y-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <Label className="text-primary flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Group Interests
                          </Label>
                          <Button type="button" variant="ghost" size="sm" onClick={addGroupInterest} className="h-8 text-zinc-400 hover:text-white">
                            <Plus className="w-4 h-4 mr-1" /> Add Person
                          </Button>
                        </div>
                        {formData.groupInterests?.map((interest, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input 
                              placeholder={`User ${idx + 1} interests...`}
                              className="bg-zinc-900 border-zinc-800 text-white"
                              value={interest}
                              onChange={(e) => updateGroupInterest(idx, e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeGroupInterest(idx)} className="text-zinc-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      <Label className="text-zinc-400">AI Enhancement Layers</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-zinc-300">Reasoning</span>
                          </div>
                          <Switch checked={formData.features?.reasoning} onCheckedChange={() => handleFeatureToggle("reasoning")} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-zinc-300">Safety Info</span>
                          </div>
                          <Switch checked={formData.features?.safety} onCheckedChange={() => handleFeatureToggle("safety")} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-zinc-300">Gamify</span>
                          </div>
                          <Switch checked={formData.features?.gamification} onCheckedChange={() => handleFeatureToggle("gamification")} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-zinc-300">Packing List</span>
                          </div>
                          <Switch checked={formData.features?.packingList} onCheckedChange={() => handleFeatureToggle("packingList")} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800 sm:col-span-2">
                          <div className="flex items-center gap-2">
                            <WifiOff className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-zinc-300">Offline-First Mode</span>
                          </div>
                          <Switch checked={formData.features?.offlineMode} onCheckedChange={() => handleFeatureToggle("offlineMode")} />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {loading ? "Generating..." : "Generate Intelligent Plan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="adapt" className="w-full max-w-2xl mt-0 outline-none">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <CloudRain className="w-5 h-5 text-blue-400" />
                    Context Adapter
                  </CardTitle>
                  <CardDescription>Adapt your plan to real-time conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdaptSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Existing Itinerary</Label>
                      <Textarea 
                        placeholder="Paste your current plan here..." 
                        className="bg-zinc-800/50 border-zinc-700 min-h-[150px] text-white"
                        value={adaptationData.existingItinerary}
                        onChange={(e) => setAdaptationData(p => ({ ...p, existingItinerary: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400 flex items-center gap-2">
                          <CloudRain className="w-4 h-4" /> Weather
                        </Label>
                        <Input 
                          placeholder="e.g. Heavy rain in afternoon" 
                          className="h-11 bg-zinc-800/50 border-zinc-700 text-white"
                          value={adaptationData.weatherData}
                          onChange={(e) => setAdaptationData(p => ({ ...p, weatherData: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400 flex items-center gap-2">
                          <Car className="w-4 h-4" /> Traffic
                        </Label>
                        <Input 
                          placeholder="e.g. High traffic in city center" 
                          className="h-11 bg-zinc-800/50 border-zinc-700 text-white"
                          value={adaptationData.trafficInfo}
                          onChange={(e) => setAdaptationData(p => ({ ...p, trafficInfo: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Delays (Optional)
                      </Label>
                      <Input 
                        placeholder="e.g. Flight delayed by 2 hours" 
                        className="h-11 bg-zinc-800/50 border-zinc-700 text-white"
                        value={adaptationData.delays}
                        onChange={(e) => setAdaptationData(p => ({ ...p, delays: e.target.value }))}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-6"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                      {loading ? "Adapting..." : "Adapt Itinerary Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Results Area */}
          <div className="w-full max-w-3xl mt-12" ref={resultsRef}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <Card className="border-zinc-800 bg-zinc-900/30">
                    <CardContent className="p-8 space-y-4">
                      <Skeleton className="h-10 w-1/3 bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Separator className="bg-zinc-800" />
                      <div className="space-y-8 pt-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-3">
                            <Skeleton className="h-8 w-1/4 bg-zinc-800" />
                            <Skeleton className="h-4 w-full bg-zinc-800" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : itinerary ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                      <Globe className="w-6 h-6 text-primary" />
                      Generated Experience
                    </h2>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                          >
                            <Download className="w-4 h-4 mr-2" /> Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                          <DropdownMenuItem onClick={() => handleExport('word')} className="cursor-pointer hover:bg-zinc-800">
                            <FileText className="w-4 h-4 mr-2 text-blue-400" /> Word Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('md')} className="cursor-pointer hover:bg-zinc-800">
                            <FileCode className="w-4 h-4 mr-2 text-zinc-400" /> Markdown File
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
                    <CardContent className="p-6 md:p-12">
                      <div className="markdown-body" id="itinerary-content">
                        <ReactMarkdown>{itinerary}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-8 text-center">
                      <p className="text-destructive font-medium mb-4">{error}</p>
                      <div className="text-xs text-zinc-500 mb-6 space-y-2 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <p className="font-semibold text-zinc-400 uppercase tracking-wider">Debug Information</p>
                        <p>Status: {process.env.GEMINI_API_KEY ? "âœ… Key Loaded" : "âŒ Key Missing"}</p>
                        {process.env.GEMINI_API_KEY && (
                          <p>Key Mask: {process.env.GEMINI_API_KEY.substring(0, 4)}...{process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 4)}</p>
                        )}
                        <div className="mt-2 pt-2 border-t border-zinc-800 text-left">
                          <p className="text-zinc-400 mb-1">Troubleshooting 403 Error:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Create a <b>NEW</b> key in a <b>NEW</b> project in AI Studio.</li>
                            <li>Ensure "Generative AI API" is enabled in Cloud Console.</li>
                            <li>Check for "Website Restrictions" on the key.</li>
                          </ul>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setError(null)}>Try Again</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <Plane className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-zinc-400 mb-2">Awaiting Your Input</h3>
                  <p className="text-zinc-500 max-w-xs">
                    Use the Intelligent Planner to create a new journey or the Context Adapter to modify an existing one.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 mt-20">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6 mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-white">Voyager Pro</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 Voyager AI. The future of travel.</p>
        </div>
      </footer>
    </div>
  );
}

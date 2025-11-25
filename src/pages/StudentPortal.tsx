import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Calendar, Bus } from "lucide-react";
import { toast } from "sonner";

const StudentPortal = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bus request submitted successfully!");
    // API call would go here
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Student Portal</h1>
          <p className="text-muted-foreground">Request campus transport and track your bus</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                Request Transport
              </CardTitle>
              <CardDescription>Fill in your travel details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Pickup Location
                  </Label>
                  <Input
                    id="source"
                    placeholder="Enter your pickup location"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="Enter your destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Your Active Requests</CardTitle>
              <CardDescription>Track your pending and ongoing trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Main Gate → Library</p>
                      <p className="text-sm text-muted-foreground">Today, 3:30 PM</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-warning text-warning-foreground rounded">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Bus ETA: 10 minutes</p>
                </div>

                <div className="p-4 border border-border rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Hostel → Academic Block</p>
                      <p className="text-sm text-muted-foreground">Today, 9:00 AM</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-accent text-accent-foreground rounded">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Bus Tracking Section */}
        <Card className="mt-6 shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle>Live Bus Tracking</CardTitle>
            <CardDescription>See real-time locations of campus buses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Interactive map will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;

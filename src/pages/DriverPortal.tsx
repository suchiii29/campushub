import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Users, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const DriverPortal = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isSharing && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get location");
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isSharing]);

  const toggleLocationSharing = () => {
    setIsSharing(!isSharing);
    toast.success(isSharing ? "Location sharing stopped" : "Location sharing started");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Driver Portal</h1>
          <p className="text-muted-foreground">Manage routes and share live location</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Status Card */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">GPS Tracking</span>
                  <Badge variant={isSharing ? "default" : "secondary"}>
                    {isSharing ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Button
                  onClick={toggleLocationSharing}
                  className="w-full"
                  variant={isSharing ? "destructive" : "default"}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {isSharing ? "Stop Sharing" : "Start Sharing"}
                </Button>
                {currentLocation && (
                  <div className="text-xs text-muted-foreground pt-2">
                    <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                    <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Route */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle className="text-lg">Current Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm">Main Gate</p>
                    <p className="text-xs text-muted-foreground">Starting point</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-border ml-2 h-8"></div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-accent mt-1" />
                  <div>
                    <p className="font-medium text-sm">Library Block</p>
                    <p className="text-xs text-muted-foreground">Destination</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle className="text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Passengers</span>
                </div>
                <span className="font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-sm">Trips</span>
                </div>
                <span className="font-bold">6</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm">Hours</span>
                </div>
                <span className="font-bold">4.5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Instructions */}
        <Card className="shadow-[var(--shadow-medium)] mb-6">
          <CardHeader>
            <CardTitle>Route Instructions</CardTitle>
            <CardDescription>Follow these optimized directions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Head north on Campus Road</p>
                  <p className="text-sm text-muted-foreground">400 meters</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Turn right at Academic Block</p>
                  <p className="text-sm text-muted-foreground">200 meters</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Continue straight to Library</p>
                  <p className="text-sm text-muted-foreground">150 meters</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map View */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle>Navigation Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Interactive navigation map will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverPortal;

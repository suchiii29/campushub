import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Users, TrendingUp, Activity, MapPin, Clock } from "lucide-react";

const AdminPortal = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Monitor fleet, analyze demand, and optimize routes</p>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
              <Bus className="h-4 w-4 text-bus-active" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">of 12 total fleet</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students Served</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">Today's total</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2m</div>
              <p className="text-xs text-success">↓ 15% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-success">↑ 3% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demand">Demand Analysis</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Map */}
              <Card className="shadow-[var(--shadow-medium)]">
                <CardHeader>
                  <CardTitle>Live Bus Tracking</CardTitle>
                  <CardDescription>Real-time locations of all buses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive map with bus locations</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="shadow-[var(--shadow-medium)]">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest system events and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bus #5 completed route</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New demand spike detected</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-warning mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bus #3 delayed by 3 minutes</p>
                        <p className="text-xs text-muted-foreground">8 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Route optimization completed</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demand" className="space-y-6">
            {/* Demand Heatmap */}
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader>
                <CardTitle>Demand Heatmap</CardTitle>
                <CardDescription>ML-predicted high-demand zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Demand heatmap visualization</p>
                </div>
              </CardContent>
            </Card>

            {/* Demand Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-[var(--shadow-medium)]">
                <CardHeader>
                  <CardTitle className="text-sm">Library Block</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">High</span>
                    <Badge variant="destructive">87%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Peak: 3:00-4:00 PM</p>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-medium)]">
                <CardHeader>
                  <CardTitle className="text-sm">Academic Block</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">Medium</span>
                    <Badge className="bg-warning text-warning-foreground">62%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Peak: 9:00-10:00 AM</p>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-medium)]">
                <CardHeader>
                  <CardTitle className="text-sm">Sports Complex</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">Low</span>
                    <Badge className="bg-accent text-accent-foreground">34%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Peak: 5:00-6:00 PM</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((bus) => (
                <Card key={bus} className="shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Bus #{bus}</CardTitle>
                      <Badge variant={bus <= 4 ? "default" : "secondary"}>
                        {bus <= 4 ? "Active" : "Idle"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {bus <= 4 ? "On Route" : "Parking Lot"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {bus <= 4 ? `${Math.floor(Math.random() * 30 + 20)} passengers` : "0 passengers"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-accent" />
                      <span className="text-muted-foreground">
                        {bus <= 4 ? `${Math.floor(Math.random() * 3 + 1)} trips today` : "0 trips"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;

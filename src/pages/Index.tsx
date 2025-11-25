import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Users, BarChart3, MapPin, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bus className="h-12 w-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              CampusTransit
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Smart Transport Management System powered by ML-driven demand prediction and real-time GPS tracking
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/student">
              <Button size="lg" className="shadow-[var(--shadow-medium)]">
                <Users className="mr-2 h-5 w-5" />
                Student Portal
              </Button>
            </Link>
            <Link to="/driver">
              <Button size="lg" variant="secondary" className="shadow-[var(--shadow-medium)]">
                <MapPin className="mr-2 h-5 w-5" />
                Driver Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="shadow-[var(--shadow-soft)]">
                <BarChart3 className="mr-2 h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-primary">
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-Time Tracking</CardTitle>
              <CardDescription>
                Live GPS tracking of all campus buses with accurate ETA predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students and admins can monitor bus locations in real-time on interactive maps
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-accent">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-accent mb-2" />
              <CardTitle>ML Demand Prediction</CardTitle>
              <CardDescription>
                Prophet model predicts demand patterns for next hour and next day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Historical and live data analysis helps optimize bus allocation and reduce wait times
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-warning">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-warning mb-2" />
              <CardTitle>Smart Route Optimization</CardTitle>
              <CardDescription>
                K-Means clustering identifies high-demand zones for efficient routing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dynamic route planning reduces fuel consumption and improves service efficiency
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-primary">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Easy-to-use interface for booking and tracking campus transport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit travel requests with source, destination, and preferred time
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-accent">
            <CardHeader>
              <Bus className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Driver Dashboard</CardTitle>
              <CardDescription>
                GPS location sharing and route navigation for drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time directions and passenger information for optimal service delivery
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)] border-t-4 border-t-warning">
            <CardHeader>
              <Clock className="h-8 w-8 text-warning mb-2" />
              <CardTitle>Admin Analytics</CardTitle>
              <CardDescription>
                Comprehensive dashboard with demand heatmaps and fleet monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor bus movements, analyze demand patterns, and optimize operations
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-6 py-12">
        <Card className="shadow-[var(--shadow-elevated)] bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Built with Modern Technology</CardTitle>
            <CardDescription>Powered by React, TypeScript, and advanced ML models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">⚛️</span>
                </div>
                <p className="font-medium">React.js</p>
                <p className="text-xs text-muted-foreground">Frontend</p>
              </div>
              <div>
                <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">🐍</span>
                </div>
                <p className="font-medium">Python</p>
                <p className="text-xs text-muted-foreground">Backend</p>
              </div>
              <div>
                <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-warning">🧠</span>
                </div>
                <p className="font-medium">Prophet</p>
                <p className="text-xs text-muted-foreground">ML Model</p>
              </div>
              <div>
                <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">🗺️</span>
                </div>
                <p className="font-medium">Maps API</p>
                <p className="text-xs text-muted-foreground">Tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-muted-foreground">
        <p>© 2025 CampusTransit - IEEE Bengaluru Winter of Innovation</p>
        <p className="text-sm mt-2">N.Suchitra • Shreya S Patil • Varshini KS • Sinchana CE</p>
      </footer>
    </div>
  );
};

export default Index;

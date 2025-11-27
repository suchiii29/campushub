// src/pages/StudentPortal.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Calendar, Bus, LogOut, User, Bell, Menu, X, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// Firebase
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const StudentPortal = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/student/auth");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!source || !destination || !date || !time) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        userId: currentUser?.uid,
        source,
        destination,
        date,
        time,
        status: "Pending",
        createdAt: Timestamp.now(),
      });

      toast.success("Bus request submitted successfully!", {
        description: `From ${source} to ${destination}`,
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to submit request");
      return;
    }

    setSource("");
    setDestination("");

    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/student/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-700 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  CampusTransit
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Student Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="bg-gray-700 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Theme Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-gray-800" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-300" />
                )}
              </button>

              {/* Logout */}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-800 dark:text-gray-100" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800 dark:text-gray-100" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {/* User */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="bg-gray-700 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                {/* Theme Toggle Mobile */}
                <button
                  onClick={toggleTheme}
                  className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {theme === "light" ? "Enable Dark Mode" : "Disable Dark Mode"}
                </button>

                {/* Logout */}
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {getGreeting()}, {userName}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to plan your campus journey?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-6 w-6" />
                Request Campus Transport
              </CardTitle>
              <CardDescription className="text-gray-200">
                Book your ride across campus
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Pickup */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Pickup Location
                  </Label>
                  <Input
                    placeholder="e.g., Main Gate, Library"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Destination
                  </Label>
                  <Input
                    placeholder="e.g., Academic Block"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gray-700 text-white font-semibold shadow-md"
                >
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Your Active Requests
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Track your pending and completed trips
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Main Gate → Library
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Today, 3:30 PM
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-orange-500 text-white rounded-full">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-600">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Hostel → Academic Block
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Today, 9:00 AM
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    No more active requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Bus Tracking */}
        <Card className="mt-6 shadow-lg border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Bus className="h-6 w-6 text-gray-600" />
              Live Bus Tracking
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Track campus buses in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Bus className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-200 font-medium">
                Interactive Map Coming Soon
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Live GPS tracking of all campus buses
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentPortal;

import { useState } from "react";
import { 
  testConnection, 
  sendDriverLocation,
  testProtectedEndpoint 
} from "../api";
import { useAuth } from "@/contexts/AuthContext";

export default function TestConnection() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleTestConnection = async () => {
    setLoading(true);
    setResult("Testing connection...");
    try {
      const data = await testConnection();
      setResult(`✅ SUCCESS! Backend is connected!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      console.log("Connection test successful:", data);
    } catch (error: any) {
      setResult(`❌ CONNECTION FAILED\n\nError: ${error.message}`);
      console.error("Connection test failed:", error);
    }
    setLoading(false);
  };

  const handleSendLocation = async () => {
    setLoading(true);
    setResult("Sending test location...");
    try {
      const data = await sendDriverLocation("driver123", 12.9716, 77.5946);
      setResult(`✅ LOCATION SENT!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      console.log("Location sent successfully:", data);
    } catch (error: any) {
      setResult(`❌ FAILED TO SEND LOCATION\n\nError: ${error.message}`);
      console.error("Failed to send location:", error);
    }
    setLoading(false);
  };

  const handleTestProtected = async () => {
    if (!currentUser) {
      setResult("❌ You must be logged in to test protected endpoints!");
      return;
    }

    setLoading(true);
    setResult("Testing protected endpoint...");
    try {
      const data = await testProtectedEndpoint();
      setResult(`✅ AUTHENTICATED REQUEST SUCCESS!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      console.log("Protected endpoint test successful:", data);
    } catch (error: any) {
      setResult(`❌ AUTHENTICATION FAILED\n\nError: ${error.message}`);
      console.error("Protected endpoint test failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            🔌 Backend Connection Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test if your React frontend can communicate with Django backend
          </p>

          {currentUser && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ Logged in as: <strong>{currentUser.email}</strong>
              </p>
            </div>
          )}

          {!currentUser && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ Not logged in. Some tests require authentication.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? "⏳ Testing..." : "🧪 Test Connection (Public)"}
            </button>

            <button
              onClick={handleSendLocation}
              disabled={loading}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? "⏳ Sending..." : "📍 Send Test Location (Public)"}
            </button>

            <button
              onClick={handleTestProtected}
              disabled={loading || !currentUser}
              className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? "⏳ Testing..." : "🔒 Test Protected Endpoint (Auth Required)"}
            </button>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Result:</h3>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Test Plan:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1️⃣ Test public endpoints (no login needed)</li>
                <li>2️⃣ Login via Firebase</li>
                <li>3️⃣ Test protected endpoints (with auth)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
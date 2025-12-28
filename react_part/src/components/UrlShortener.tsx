import { useState, useEffect } from "react";
import { Copy, ExternalLink, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import axios from "axios"
import React from "react";

interface UrlShortenerProps {
  token: string | null;
  user: any;
  isGuest: boolean;
}
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function UrlShortener({ token, user, isGuest }: UrlShortenerProps) {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const[userURL, setUserURL] = useState<any[]>([]);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Fetch user's URLs if logged in
  useEffect(() => {
    if (token && user) {
      fetchUserURLs();
    }
  }, [token, user]);

  const fetchUserURLs = async () => {
    try{
      const response = await axios.get(`${API_BASE}/user/urls`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUserURL(response.data);
    } catch (error) {
      console.error("Error fetching user URLs:", error);
    }
  };

  // const generateShortUrl = () => {
  //   // Generate a random short code for demo purposes
  //   const shortCode = Math.random().toString(36).substring(2, 8);
  //   return `https://shortlink.co/${shortCode}`;
  // };

  const handleShorten = async () => {
  if (!url) {
    toast.error("Please enter a URL to shorten");
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post(`${API_BASE}/url`, {
      target_url: url,  // backend expects this field
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

    // backend returns "url" (the short key), "admin_url", etc.
    const shortKey = response.data.url;
    setShortenedUrl(`${API_BASE}/${shortKey}`);

    if (token){
      // If user is logged in, fetch their URLs
      fetchUserURLs();
    }

    toast.success("URL shortened successfully!");
  } catch (error) {
    console.error("Error shortening URL:", error);
    const errorMessage = axios.isAxiosError(error) 
      ? error.response?.data?.detail || "Failed to shorten URL"
      : "Failed to shorten URL";
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleShorten();
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Guest Notice */}
        {isGuest && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              You're using the shortener as a guest. Sign up to track your URLs and view analytics.
            </p>
          </div>
        )}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl mb-6 text-gray-900">
            Shorten Your URLs
            <span className="block text-primary">Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user
              ? `Welcome back, ${user.username}! Transform your long URLs into short links.`
              : "Transform long, complex URLs into short, shareable links that are perfect for social media, emails, and more."}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="Enter your long URL here (e.g., https://example.com/very/long/path)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 bg-white border-gray-200 focus:border-primary"
                />
                <Button 
                  onClick={handleShorten}
                  disabled={isLoading}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-white whitespace-nowrap"
                >
                  {isLoading ? "Shortening..." : "Shorten URL"}
                </Button>
              </div>

              {shortenedUrl && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 mb-2">Your shortened URL:</p>
                  <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-md border">
                    <span className="text-primary truncate flex-1">{shortenedUrl}</span>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(shortenedUrl, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Free to use
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              No registration required
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Instant results
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
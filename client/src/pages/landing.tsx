import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, BarChart3, Calendar, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[hsl(200,98%,54%)] to-[hsl(329,77%,53%)] rounded-lg flex items-center justify-center">
              <Share2 className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SocialSync</h1>
              <p className="text-xs text-gray-500">Content Manager</p>
            </div>
          </div>
          <Button onClick={handleLogin}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Social Media 
            <span className="text-[hsl(200,98%,54%)]"> Presence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create, schedule, and analyze content across 13 social media platforms. 
            Streamline your social media workflow with powerful analytics and team collaboration.
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Button size="lg" onClick={handleLogin} className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Platform Icons */}
          <div className="flex justify-center items-center space-x-6 mb-16">
            <div className="text-gray-400">Supports 13+ platforms:</div>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded bg-[hsl(221,44%,41%)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 rounded bg-[hsl(329,77%,53%)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">📷</span>
              </div>
              <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded bg-[hsl(201,100%,35%)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              <div className="text-gray-400">+9 more</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Share2 className="w-8 h-8 text-[hsl(200,98%,54%)] mb-2" />
              <CardTitle className="text-lg">Multi-Platform Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Post to 13 social platforms simultaneously with platform-specific optimizations.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-8 h-8 text-[hsl(329,77%,53%)] mb-2" />
              <CardTitle className="text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Schedule posts for optimal engagement times with our intelligent calendar system.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-[hsl(221,44%,41%)] mb-2" />
              <CardTitle className="text-lg">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Track performance across all platforms with comprehensive analytics and insights.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-[hsl(201,100%,35%)] mb-2" />
              <CardTitle className="text-lg">Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Collaborate with your team using role-based permissions and workflow management.</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Streamline Your Social Media?
              </h2>
              <p className="text-gray-600 mb-6">
                Join thousands of marketers who trust SocialSync to manage their social media presence.
              </p>
              <Button size="lg" onClick={handleLogin} className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

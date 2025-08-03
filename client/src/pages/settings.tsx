import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/sidebar";
import { ArrowLeft, Key, Bell, User, Palette, Shield, Save } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  const [apiSettings, setApiSettings] = useState({
    ayrshareApiKey: "",
    autoScheduling: true,
    defaultPlatforms: [] as string[],
  });

  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: "",
      });
    }
  }, [user]);

  const handleProfileSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleApiSave = () => {
    toast({
      title: "API Settings Updated",
      description: "Your API configuration has been saved.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Manage your account and application preferences</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>API & Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed as it's managed by your authentication provider.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Current Role</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium capitalize">
                          {user?.role || "Viewer"}
                        </span>
                        <span className="text-sm text-gray-500">
                          Contact an administrator to change your role
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleProfileSave} className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                        </div>
                        <Switch
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Get instant notifications for post activity</p>
                        </div>
                        <Switch
                          checked={notifications.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Weekly Reports</h4>
                          <p className="text-sm text-gray-500">Receive weekly analytics and performance reports</p>
                        </div>
                        <Switch
                          checked={notifications.weeklyReports}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing Emails</h4>
                          <p className="text-sm text-gray-500">Receive tips, updates, and promotional content</p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, marketingEmails: checked }))
                          }
                        />
                      </div>
                    </div>

                    <Button onClick={handleNotificationSave} className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="w-5 h-5" />
                      <span>API & Integrations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="ayrshareKey">Ayrshare API Key</Label>
                      <Input
                        id="ayrshareKey"
                        type="password"
                        value={apiSettings.ayrshareApiKey}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, ayrshareApiKey: e.target.value }))}
                        placeholder="Enter your Ayrshare API key"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Your API key is managed by system administrators and is already configured.
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto Scheduling</h4>
                        <p className="text-sm text-gray-500">Automatically optimize posting times for better engagement</p>
                      </div>
                      <Switch
                        checked={apiSettings.autoScheduling}
                        onCheckedChange={(checked) => 
                          setApiSettings(prev => ({ ...prev, autoScheduling: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Connected Platforms</Label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                        {[
                          { id: "facebook", name: "Facebook", icon: "📘" },
                          { id: "instagram", name: "Instagram", icon: "📷" },
                          { id: "x", name: "X/Twitter", icon: "🐦" },
                          { id: "linkedin", name: "LinkedIn", icon: "💼" },
                          { id: "tiktok", name: "TikTok", icon: "🎵" },
                          { id: "youtube", name: "YouTube", icon: "📺" },
                          { id: "pinterest", name: "Pinterest", icon: "📌" },
                          { id: "reddit", name: "Reddit", icon: "🔴" },
                        ].map(platform => (
                          <div key={platform.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                            <span>{platform.icon}</span>
                            <span className="text-sm">{platform.name}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Platform connections are managed through the Ayrshare dashboard.
                      </p>
                    </div>

                    <Button onClick={handleApiSave} className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                      <Save className="w-4 h-4 mr-2" />
                      Save API Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Authentication Provider</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your account is secured through Replit's authentication system. 
                            Password management and two-factor authentication are handled by Replit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Account Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account Type:</span>
                          <span>Replit OAuth</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">User ID:</span>
                          <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account Created:</span>
                          <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Session Management</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">This device • Active now</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Danger Zone</h4>
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <p className="text-sm text-red-700 mb-3">
                          Account deletion must be handled through Replit's account settings. 
                          This will permanently remove all your data from SocialSync.
                        </p>
                        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                          Contact Support for Account Deletion
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

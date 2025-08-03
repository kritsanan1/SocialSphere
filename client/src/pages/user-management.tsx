import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Sidebar from "@/components/sidebar";
import { ArrowLeft, UserPlus, MoreHorizontal, Shield, Edit, Users } from "lucide-react";
import { Link } from "wouter";

export default function UserManagement() {
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

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "editor":
        return <Badge className="bg-blue-500">Editor</Badge>;
      case "viewer":
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 5) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (diffInMinutes < 60) {
      return <Badge className="bg-yellow-500">Away</Badge>;
    } else {
      return <Badge variant="secondary">Offline</Badge>;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has admin access
  if (user?.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Admin Access Required
              </h3>
              <p className="text-gray-500 mb-6">
                You need administrator privileges to access user management.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage team members and their permissions</p>
              </div>
            </div>
            <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Current user */}
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user?.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(user?.firstName, user?.lastName, user?.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user?.firstName && user?.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user?.email || "Current User"
                                }
                                <span className="text-sm text-gray-500 ml-2">(You)</span>
                              </p>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user?.role || "viewer")}</TableCell>
                        <TableCell className="text-sm text-gray-900">Just now</TableCell>
                        <TableCell>{getStatusBadge(new Date().toISOString())}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Demo users since API returns empty array */}
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50" />
                              <AvatarFallback>MC</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">Mike Chen</p>
                              <p className="text-sm text-gray-500">mike@company.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge("editor")}</TableCell>
                        <TableCell className="text-sm text-gray-900">1 hour ago</TableCell>
                        <TableCell>{getStatusBadge(new Date(Date.now() - 60 * 60 * 1000).toISOString())}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50" />
                              <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">Emma Rodriguez</p>
                              <p className="text-sm text-gray-500">emma@company.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge("viewer")}</TableCell>
                        <TableCell className="text-sm text-gray-900">3 hours ago</TableCell>
                        <TableCell>{getStatusBadge(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {(!users || users.length === 0) && !usersLoading && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Team Management Coming Soon
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Advanced user management features are being developed. Currently showing your user information.
                  </p>
                  <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request Team Features
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

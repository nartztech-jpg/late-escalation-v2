import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: gmailStatus } = trpc.gmail.getStatus.useQuery();
  const disconnectGmailMutation = trpc.gmail.disconnect.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleDisconnectGmail = async () => {
    try {
      await disconnectGmailMutation.mutateAsync();
      toast.success("Gmail disconnected");
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect Gmail");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-semibold text-foreground">{user?.name || "Not set"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-semibold text-foreground">{user?.email || "Not set"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Member Since</Label>
                <p className="font-semibold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gmail Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Gmail Integration</CardTitle>
              <CardDescription>Connect your Gmail account for automated email sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Gmail Status</p>
                    <p className="text-sm text-muted-foreground">
                      {gmailStatus?.isConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {gmailStatus?.isConnected ? (
                  <Button
                    onClick={handleDisconnectGmail}
                    disabled={disconnectGmailMutation.isPending}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    {disconnectGmailMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled
                  >
                    Connect Gmail
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Gmail integration allows us to send reminder emails on your behalf. Your credentials are securely encrypted.
              </p>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates about your invoices</p>
                  </div>
                  <div className="w-12 h-6 bg-accent rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified when reminders are sent</p>
                  </div>
                  <div className="w-12 h-6 bg-accent rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 border-red-200"
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

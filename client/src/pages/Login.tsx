import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    if (email) {
      setIsLoading(true);
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">LateEscalate</h1>
          <p className="text-muted-foreground">Get paid faster with automated reminders</p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-10"
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={!email || isLoading}
              className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              {isLoading ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">New to LateEscalate?</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.href = "/signup"}
              className="w-full h-10"
            >
              Create an account
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

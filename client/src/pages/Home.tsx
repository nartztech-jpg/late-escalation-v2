import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Zap, Clock, BarChart3, Mail, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">LateEscalate</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In
            </Button>
            <Button
              onClick={() => window.location.href = "/signup"}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Stop writing awkward payment chase emails
          </h1>
          <p className="text-xl text-muted-foreground">
            Set up your invoice once. We send polite reminders — escalating to formal legal notice — until you get paid.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => window.location.href = "/signup"}
              className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Three-Step Explainer */}
      <section className="bg-card border-y border-border py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Enter Invoice</h3>
              <p className="text-muted-foreground">
                Add your client details, invoice amount, and due date. Choose your preferred email tone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Preview Emails</h3>
              <p className="text-muted-foreground">
                AI generates 4 escalating emails. Review, edit, and customize before activation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get Paid</h3>
              <p className="text-muted-foreground">
                Emails send automatically. Mark as paid when you receive payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">Powerful features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI-Generated Emails</h3>
              <p className="text-muted-foreground">
                Claude generates personalized, professional reminder emails tailored to your tone preference.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Automatic Scheduling</h3>
              <p className="text-muted-foreground">
                Emails send automatically on days 3, 7, 14, and 30 past due. No manual work required.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">4-Stage Escalation</h3>
              <p className="text-muted-foreground">
                Polite reminder → Firm notice → Final warning → Legal notice. Escalates automatically.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Full Control</h3>
              <p className="text-muted-foreground">
                Edit any email before sending. Mark as paid to cancel remaining emails instantly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-card border-y border-border py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Simple, transparent pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Free</h3>
                  <p className="text-muted-foreground mt-1">Perfect for trying it out</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground">$0</p>
                  <p className="text-muted-foreground text-sm">forever</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">1 active invoice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">4-stage escalation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">AI-generated emails</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-accent">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                  <p className="text-muted-foreground mt-1">For serious freelancers</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-accent">$19</p>
                  <p className="text-muted-foreground text-sm">/month, cancel anytime</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">Unlimited invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">4-stage escalation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-foreground">Priority sending</span>
                  </li>
                </ul>
                <Button
                  onClick={() => window.location.href = "/signup"}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-accent/5 rounded-lg p-12 border border-accent/20">
          <h2 className="text-3xl font-bold text-foreground">Ready to get paid faster?</h2>
          <p className="text-lg text-muted-foreground">
            Join freelancers who are automating their payment reminders with LateEscalate.
          </p>
          <Button
            onClick={() => window.location.href = "/signup"}
            className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground">LateEscalate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 LateEscalate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

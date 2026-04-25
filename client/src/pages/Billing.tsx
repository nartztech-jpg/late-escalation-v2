import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Billing() {
  const [, setLocation] = useLocation();
  const { data: billingStatus } = trpc.billing.getStatus.useQuery();
  const cancelSubscriptionMutation = trpc.billing.cancelSubscription.useMutation();

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      await cancelSubscriptionMutation.mutateAsync();
      toast.success("Subscription cancelled");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    }
  };

  const handleUpgrade = () => {
    // In a real implementation, this would redirect to Stripe Checkout
    toast.info("Stripe integration coming soon");
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
          <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your plan and billing information</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    {billingStatus?.isSubscribed ? "Pro Plan" : "Free Plan"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {billingStatus?.isSubscribed
                      ? "Unlimited invoices, priority sending"
                      : `${billingStatus?.invoiceLimit || 1} active invoice allowed`}
                  </p>
                </div>
                <Badge className={billingStatus?.isSubscribed ? "bg-accent" : "bg-muted"}>
                  {billingStatus?.isSubscribed ? "Active" : "Free Trial"}
                </Badge>
              </div>

              {billingStatus?.isSubscribed && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Subscription ID</p>
                  <p className="font-mono text-sm text-foreground">
                    {billingStatus.stripeSubscriptionId || "N/A"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Plans & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <Card className={!billingStatus?.isSubscribed ? "border-accent" : "border-border"}>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-3xl font-bold text-foreground">$0</p>
                    <p className="text-sm text-muted-foreground">forever</p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">1 active invoice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">4-stage email sequences</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">AI-generated emails</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Priority sending</span>
                    </li>
                  </ul>

                  {!billingStatus?.isSubscribed ? (
                    <Button disabled className="w-full" variant="outline">
                      Current Plan
                    </Button>
                  ) : (
                    <Button onClick={handleCancelSubscription} variant="outline" className="w-full">
                      Downgrade
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className={billingStatus?.isSubscribed ? "border-accent" : "border-border"}>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For serious freelancers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-3xl font-bold text-accent">$19</p>
                    <p className="text-sm text-muted-foreground">/month, cancel anytime</p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">Unlimited invoices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">4-stage email sequences</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">AI-generated emails</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">Priority sending</span>
                    </li>
                  </ul>

                  {billingStatus?.isSubscribed ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpgrade}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and charges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No billing history yet. Upgrade to Pro to see your invoices here.
              </p>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll have access to Pro features until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">What happens to my invoices if I downgrade?</h4>
                <p className="text-sm text-muted-foreground">
                  Your existing invoices will remain active, but you'll be limited to 1 new active invoice on the Free plan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, the Free plan is our trial. You can create and manage 1 invoice completely free.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

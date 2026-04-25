import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Eye, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const { data: billingStatus } = trpc.billing.getStatus.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground">escalating</Badge>;
      case "paid":
        return <Badge className="bg-green-600 text-white">paid</Badge>;
      case "cancelled":
        return <Badge variant="outline">cancelled</Badge>;
      default:
        return <Badge variant="secondary">pending</Badge>;
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name || "Freelancer"}
              </p>
            </div>
            <Button
              onClick={() => window.location.href = "/invoices/new"}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Active Invoices</p>
                <p className="text-3xl font-bold text-accent">
                  {invoices?.filter(i => i.status === "active").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  {invoices?.filter(i => i.status === "paid").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Plan</p>
                <p className="text-3xl font-bold text-foreground">
                  {billingStatus?.isSubscribed ? "Pro" : "Free"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-accent" />
              </div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No invoices yet</p>
                <Button
                  onClick={() => window.location.href = "/invoices/new"}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Create your first invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Days Overdue</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{invoice.clientName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          ${parseFloat(invoice.amount as any).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {getDaysOverdue(invoice.dueDate as any)} days
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = `/invoices/${invoice.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status === "active" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {!billingStatus?.isSubscribed && (
          <Card className="mt-8 bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ready to scale?</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Pro for unlimited invoices and priority email sending
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "/billing"}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

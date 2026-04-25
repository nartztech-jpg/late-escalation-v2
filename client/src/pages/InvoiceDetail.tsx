import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(id || "0");

  const { data: invoice, isLoading } = trpc.invoices.get.useQuery({ id: invoiceId });
  const { data: emails } = trpc.emails.getByInvoice.useQuery({ invoiceId });
  const markPaidMutation = trpc.invoices.markPaid.useMutation();
  const cancelMutation = trpc.invoices.cancel.useMutation();

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync({ id: invoiceId });
      toast.success("Invoice marked as paid. All pending emails have been cancelled.");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark invoice as paid");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: invoiceId });
      toast.success("Escalation sequence cancelled.");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel sequence");
    }
  };

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

  const getEmailStageName = (stage: number) => {
    switch (stage) {
      case 1:
        return "polite reminder";
      case 2:
        return "firm notice";
      case 3:
        return "final warning";
      case 4:
        return "legal notice";
      default:
        return `stage ${stage}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-accent" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Invoice not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-muted-foreground mt-1">{invoice.clientName}</p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold text-foreground">{invoice.clientName}</p>
                    <p className="text-sm text-muted-foreground">{invoice.clientFirstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{invoice.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-foreground text-lg">
                      ${parseFloat(invoice.amount as any).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Services</p>
                  <p className="text-foreground">{invoice.services}</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {!emails || emails.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No emails generated yet. Activate the sequence to generate emails.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {emails.map((email, index) => (
                      <div key={email.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10">
                              {email.status === "sent" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : email.status === "cancelled" ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <Mail className="h-4 w-4 text-accent" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground capitalize">
                                {getEmailStageName(email.stage)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Scheduled for {new Date(email.scheduledFor).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={email.status === "sent" ? "default" : "outline"}>
                            {email.status}
                          </Badge>
                        </div>
                        <div className="bg-muted/50 rounded p-3 space-y-2">
                          <p className="text-sm font-semibold text-foreground">Subject:</p>
                          <p className="text-sm text-foreground">{email.subject}</p>
                          <p className="text-sm font-semibold text-foreground mt-3">Preview:</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{email.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.status === "active" && (
                  <>
                    <Button
                      onClick={handleMarkPaid}
                      disabled={markPaidMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {markPaidMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Marking as paid...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Sequence
                        </>
                      )}
                    </Button>
                  </>
                )}
                {invoice.status === "paid" && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">Invoice Paid</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <p className="font-semibold text-foreground capitalize">{invoice.status}</p>
                </div>
                {invoice.sequenceActivatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Activated</p>
                    <p className="font-semibold text-foreground">
                      {new Date(invoice.sequenceActivatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

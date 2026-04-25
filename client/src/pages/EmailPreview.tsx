import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function EmailPreview() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(id || "0");
  const [selectedEmail, setSelectedEmail] = useState<number>(0);

  const { data: invoice } = trpc.invoices.get.useQuery({ id: invoiceId });
  const generateMutation = trpc.invoices.generateSequence.useMutation();
  const activateMutation = trpc.invoices.activateSequence.useMutation();
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([]);

  const handleGenerateEmails = async () => {
    try {
      const result = await generateMutation.mutateAsync({ invoiceId });
      setGeneratedEmails(result.emails);
      toast.success("Emails generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate emails");
    }
  };

  const handleActivateSequence = async () => {
    try {
      await activateMutation.mutateAsync({ invoiceId });
      toast.success("Escalation sequence activated!");
      setLocation(`/invoices/${invoiceId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to activate sequence");
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
            onClick={() => setLocation(`/invoices/${invoiceId}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoice
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Email Sequence Preview</h1>
          <p className="text-muted-foreground mt-1">
            Review and customize your 4-stage escalation emails
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {generatedEmails.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-12 pb-12 text-center space-y-6">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Ready to generate emails?
                  </h2>
                  <p className="text-muted-foreground">
                    Claude will create 4 personalized escalation emails tailored to your invoice and tone preference.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateEmails}
                  disabled={generateMutation.isPending}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating emails...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate Email Sequence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-2">
              {generatedEmails.map((email, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEmail(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedEmail === index
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <p className="font-semibold text-foreground capitalize text-sm">
                    {getEmailStageName(email.stage)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Day {[3, 7, 14, 30][index]}
                  </p>
                </button>
              ))}
            </div>

            {/* Email Preview */}
            <div className="lg:col-span-3 space-y-6">
              {generatedEmails[selectedEmail] && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {getEmailStageName(generatedEmails[selectedEmail].stage)} — Day {[3, 7, 14, 30][selectedEmail]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Subject:</p>
                        <div className="bg-muted/50 rounded p-3 border border-border">
                          <p className="text-foreground font-medium">
                            {generatedEmails[selectedEmail].subject}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Email Body:</p>
                        <div className="bg-muted/50 rounded p-4 border border-border min-h-64">
                          <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {generatedEmails[selectedEmail].body}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          💡 <strong>Tip:</strong> You can edit this email after activation. All changes are saved and will be sent to your client.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/invoices/${invoiceId}`)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleActivateSequence}
                  disabled={activateMutation.isPending}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {activateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate Sequence
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

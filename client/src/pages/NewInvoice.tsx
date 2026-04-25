import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewInvoice() {
  const [, setLocation] = useLocation();
  const createInvoiceMutation = trpc.invoices.create.useMutation();
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientFirstName: "",
    clientEmail: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    services: "",
    tone: "warm-professional" as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToneChange = (value: string) => {
    setFormData(prev => ({ ...prev, tone: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientName || !formData.clientFirstName || !formData.clientEmail || 
        !formData.invoiceNumber || !formData.amount || !formData.dueDate || !formData.services) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await createInvoiceMutation.mutateAsync(formData);
      toast.success("Invoice created successfully");
      setLocation(`/invoices/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice");
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
          <h1 className="text-3xl font-bold text-foreground">Create New Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Set up your invoice and we'll generate AI-powered reminder emails
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Client Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Company Name *</Label>
                      <Input
                        id="clientName"
                        name="clientName"
                        placeholder="Acme Corp"
                        value={formData.clientName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientFirstName">Client First Name *</Label>
                      <Input
                        id="clientFirstName"
                        name="clientFirstName"
                        placeholder="John"
                        value={formData.clientFirstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email Address *</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      placeholder="john@acme.com"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Invoice Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                      <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        placeholder="INV-2024-001"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="1500.00"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services">Services Provided *</Label>
                    <Textarea
                      id="services"
                      name="services"
                      placeholder="Web design and development for company website..."
                      value={formData.services}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Email Preferences */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Email Preferences</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tone">Email Tone *</Label>
                    <Select value={formData.tone} onValueChange={handleToneChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm-professional">
                          Warm & Professional (friendly, understanding)
                        </SelectItem>
                        <SelectItem value="strictly-professional">
                          Strictly Professional (formal, business-like)
                        </SelectItem>
                        <SelectItem value="direct">
                          Direct & Firm (assertive, no-nonsense)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createInvoiceMutation.isPending}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {createInvoiceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Invoice...
                      </>
                    ) : (
                      "Continue to Email Preview"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

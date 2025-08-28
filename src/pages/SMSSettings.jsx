
import React, { useState, useEffect } from "react";
import { SMSSettings } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { testSMS } from "@/api/functions";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  MessageSquare,
  Shield,
  Clock,
  Phone,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

export default function SMSSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    twilio_account_sid: "",
    twilio_auth_token: "",
    twilio_phone_number: "",
    sender_name: "",
    auto_reply_enabled: true,
    business_hours_start: "09:00",
    business_hours_end: "18:00",
    out_of_hours_message: "Thanks for your message! We'll respond during business hours (9 AM - 6 PM).",
    monthly_sms_limit: 1000,
    client_id: "demo-client-1"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsList = await SMSSettings.list();
      if (settingsList.length > 0) {
        const existingSettings = settingsList[0];
        setSettings(existingSettings);
        setFormData({...existingSettings});
      }
    } catch (error) {
      console.error("Error loading SMS settings:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (settings) {
        await SMSSettings.update(settings.id, formData);
        toast({ title: "Settings Saved", description: "Your SMS settings have been updated.", variant: "success" });
      } else {
        await SMSSettings.create(formData);
        toast({ title: "Settings Saved", description: "Your SMS settings have been configured.", variant: "success" });
      }
      loadSettings();
    } catch (error) {
      console.error("Error saving SMS settings:", error);
      toast({ title: "Save Failed", description: error.message || "An error occurred while saving settings.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendTest = async () => {
    if (!testPhoneNumber) {
      toast({ title: "Error", description: "Please enter a phone number to send the test message to.", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      const { data } = await testSMS({
        sid: formData.twilio_account_sid,
        token: formData.twilio_auth_token,
        from: formData.twilio_phone_number,
        to: testPhoneNumber,
      });

      if (data.success) {
        toast({ title: "Success!", description: `Test message sent to ${testPhoneNumber}.` });
      } else {
        toast({ title: "Test Failed", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Test Failed", description: error.response?.data?.error || "An unknown error occurred. Check credentials.", variant: "destructive" });
    }
    setTesting(false);
  };

  const isConfigured = settings && settings.twilio_account_sid && settings.twilio_auth_token && settings.twilio_phone_number;
  const usagePercentage = settings ? Math.round((settings.sms_sent_this_month / settings.monthly_sms_limit) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SMS Settings</h1>
            <p className="text-slate-600 mt-1">Configure Twilio SMS integration for your business</p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              SMS Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                )}
                <div>
                  <p className="font-semibold text-slate-900">
                    {isConfigured ? "SMS Configured" : "SMS Not Configured"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {isConfigured ? "Ready to send SMS messages" : "Complete setup to enable SMS"}
                  </p>
                </div>
              </div>

              {settings && (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Monthly Usage</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>{settings.sms_sent_this_month || 0} sent</span>
                        <span>{settings.monthly_sms_limit} limit</span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Phone Number</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {settings.twilio_phone_number || "Not configured"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!isConfigured && (
          <Card className="bg-blue-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Get Started with Twilio SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Create a Twilio account at <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">twilio.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Purchase a phone number from your Twilio console</li>
                  <li>Get your Account SID and Auth Token from the Twilio dashboard</li>
                  <li>Enter your credentials in the form below</li>
                  <li>Test your configuration by sending a message</li>
                </ol>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your Twilio credentials are encrypted and stored securely. They are only used to send SMS messages on your behalf.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Twilio Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="twilio_account_sid">Twilio Account SID</Label>
                  <Input
                    id="twilio_account_sid"
                    type="password"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={formData.twilio_account_sid}
                    onChange={(e) => handleInputChange('twilio_account_sid', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twilio_auth_token">Twilio Auth Token</Label>
                  <Input
                    id="twilio_auth_token"
                    type="password"
                    placeholder="Your auth token"
                    value={formData.twilio_auth_token}
                    onChange={(e) => handleInputChange('twilio_auth_token', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twilio_phone_number">Twilio Phone Number</Label>
                  <Input
                    id="twilio_phone_number"
                    placeholder="+1234567890"
                    value={formData.twilio_phone_number}
                    onChange={(e) => handleInputChange('twilio_phone_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sender_name">Business Name</Label>
                  <Input
                    id="sender_name"
                    placeholder="Your Business Name"
                    value={formData.sender_name}
                    onChange={(e) => handleInputChange('sender_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Business Hours & Auto-Reply</h4>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_reply_enabled"
                    checked={formData.auto_reply_enabled}
                    onCheckedChange={(checked) => handleInputChange('auto_reply_enabled', checked)}
                  />
                  <Label htmlFor="auto_reply_enabled">Enable automatic replies</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_hours_start">Business Hours Start</Label>
                    <Input
                      id="business_hours_start"
                      type="time"
                      value={formData.business_hours_start}
                      onChange={(e) => handleInputChange('business_hours_start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_hours_end">Business Hours End</Label>
                    <Input
                      id="business_hours_end"
                      type="time"
                      value={formData.business_hours_end}
                      onChange={(e) => handleInputChange('business_hours_end', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="out_of_hours_message">Out of Hours Message</Label>
                  <Textarea
                    id="out_of_hours_message"
                    value={formData.out_of_hours_message}
                    onChange={(e) => handleInputChange('out_of_hours_message', e.target.value)}
                    placeholder="Message to send when contacted outside business hours"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly_sms_limit">Monthly SMS Limit</Label>
                  <Input
                    id="monthly_sms_limit"
                    type="number"
                    value={formData.monthly_sms_limit}
                    onChange={(e) => handleInputChange('monthly_sms_limit', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Test SMS Card */}
        {isConfigured && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Test SMS Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Send a test SMS to verify your configuration is working correctly.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Enter phone number to test (e.g., +1234567890)" 
                    className="flex-1"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                  />
                  <Button onClick={handleSendTest} disabled={testing}>
                    {testing ? "Sending..." : "Send Test SMS"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </div>
  );
}

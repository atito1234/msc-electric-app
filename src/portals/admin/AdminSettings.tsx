import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { seedSupabase } from '@/utils/seed-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  Camera,
  Lock,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Globe,
  Check,
  Database
} from 'lucide-react';

export function AdminSettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('dark');

  // Profile form state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '(281) 905-6830',
    title: 'Master Electrician & CEO',
    bio: '30+ years of experience in electrical contracting. Committed to excellence and innovation in every project.',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewProjects: true,
    emailInvoices: true,
    emailPayments: true,
    emailWorkOrders: false,
    pushProjectUpdates: true,
    pushMessages: true,
    pushApprovals: true,
    smsUrgent: true,
    dailyDigest: false,
    weeklyReport: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30',
  });

  // Billing settings
  const [billing, setBilling] = useState({
    companyName: 'MSC Electric LLC',
    taxId: 'XX-XXXXXXX',
    paymentMethod: 'bank',
    autoInvoice: true,
    lateFee: true,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success(`${section} settings saved successfully`);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account preferences and system configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Database className="w-4 h-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal and professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-black">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                    <Camera className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
                <div>
                  <h3 className="text-white font-medium">Profile Photo</h3>
                  <p className="text-zinc-400 text-sm">JPG, PNG or GIF. Max 2MB.</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      Upload New
                    </Button>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-zinc-300">Job Title</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('Profile')}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNewProjects', label: 'New Project Assignments', desc: 'When you\'re assigned to a new project' },
                    { key: 'emailInvoices', label: 'Invoice Updates', desc: 'When invoices are created or paid' },
                    { key: 'emailPayments', label: 'Payment Confirmations', desc: 'When payments are received' },
                    { key: 'emailWorkOrders', label: 'Work Order Changes', desc: 'When work orders are modified', default: false },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-zinc-300">{item.label}</p>
                        <p className="text-zinc-500 text-sm">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Push Notifications */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                  Push Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'pushProjectUpdates', label: 'Project Updates', desc: 'Real-time project status changes' },
                    { key: 'pushMessages', label: 'Messages', desc: 'When you receive new messages' },
                    { key: 'pushApprovals', label: 'Approval Requests', desc: 'When approvals are needed' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-zinc-300">{item.label}</p>
                        <p className="text-zinc-500 text-sm">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Digest & Reports */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  Digest & Reports
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-zinc-300">Daily Digest</p>
                      <p className="text-zinc-500 text-sm">Summary of daily activities</p>
                    </div>
                    <Switch
                      checked={notifications.dailyDigest}
                      onCheckedChange={() => handleNotificationChange('dailyDigest')}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-zinc-300">Weekly Report</p>
                      <p className="text-zinc-500 text-sm">Comprehensive weekly analytics</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={() => handleNotificationChange('weeklyReport')}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('Notification')}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Security Settings
              </CardTitle>
              <CardDescription>Protect your account with advanced security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">New Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800 text-white" />
                  </div>
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Update Password
                  </Button>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Two-Factor Authentication */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-zinc-300">Enable 2FA</p>
                    <p className="text-zinc-500 text-sm">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Session Settings */}
              <div>
                <h3 className="text-white font-medium mb-4">Session Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-zinc-300">Login Alerts</p>
                      <p className="text-zinc-500 text-sm">Get notified of new logins</p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white w-32"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('Security')}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Billing Information
              </CardTitle>
              <CardDescription>Manage your company billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Company Name</Label>
                  <Input
                    value={billing.companyName}
                    onChange={(e) => setBilling({ ...billing, companyName: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tax ID / EIN</Label>
                  <Input
                    value={billing.taxId}
                    onChange={(e) => setBilling({ ...billing, taxId: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Payment Method */}
              <div>
                <h3 className="text-white font-medium mb-4">Payment Method</h3>
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded" />
                      <div>
                        <p className="text-zinc-300">•••• •••• •••• 4521</p>
                        <p className="text-zinc-500 text-sm">Expires 12/26</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Default</Badge>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  + Add Payment Method
                </Button>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Billing Preferences */}
              <div>
                <h3 className="text-white font-medium mb-4">Billing Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-zinc-300">Auto-Generate Invoices</p>
                      <p className="text-zinc-500 text-sm">Automatically create invoices on project completion</p>
                    </div>
                    <Switch
                      checked={billing.autoInvoice}
                      onCheckedChange={(checked) => setBilling({ ...billing, autoInvoice: checked })}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-zinc-300">Late Fee Application</p>
                      <p className="text-zinc-500 text-sm">Automatically apply late fees on overdue invoices</p>
                    </div>
                    <Switch
                      checked={billing.lateFee}
                      onCheckedChange={(checked) => setBilling({ ...billing, lateFee: checked })}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('Billing')}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Billing Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="text-white font-medium mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                      ? 'border-amber-500 bg-zinc-800'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                  >
                    <Moon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-zinc-300 text-center">Dark</p>
                    {theme === 'dark' && (
                      <Check className="w-4 h-4 text-amber-500 mx-auto mt-2" />
                    )}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${theme === 'light'
                      ? 'border-amber-500 bg-zinc-800'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                  >
                    <Sun className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-zinc-300 text-center">Light</p>
                    {theme === 'light' && (
                      <Check className="w-4 h-4 text-amber-500 mx-auto mt-2" />
                    )}
                  </button>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Accent Color */}
              <div>
                <h3 className="text-white font-medium mb-4">Accent Color</h3>
                <div className="flex gap-3">
                  {['amber', 'blue', 'green', 'purple', 'red'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full bg-${color}-500 border-2 ${color === 'amber' ? 'border-white' : 'border-transparent'
                        } hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Dashboard Layout */}
              <div>
                <h3 className="text-white font-medium mb-4">Dashboard Layout</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input type="radio" name="layout" defaultChecked className="text-amber-500" />
                    <div>
                      <p className="text-zinc-300">Compact</p>
                      <p className="text-zinc-500 text-sm">More information at a glance</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700">
                    <input type="radio" name="layout" className="text-amber-500" />
                    <div>
                      <p className="text-zinc-300">Comfortable</p>
                      <p className="text-zinc-500 text-sm">More spacing between elements</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('Appearance')}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Appearance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                Database Management
              </CardTitle>
              <CardDescription>Manage your database and seed initial data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-4">Seed Data</h3>
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-300 mb-4">
                    Populate the database with initial test data including users, projects, and invoices.
                    <br />
                    <span className="text-yellow-500 text-sm">Warning: This may duplicate data if run multiple times without clearing.</span>
                  </p>
                  <Button
                    onClick={() => seedSupabase()}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Seed Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

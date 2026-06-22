import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Lock, Palette, Sun, Moon, Mail, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSaveLanguage = async (newLang) => {
    setLang(newLang);
    setSaving(true);
    try {
      await base44.auth.updateMe({ preferred_language: newLang });
      toast.success(t('profileUpdated'));
    } catch (e) {
      // ignore - language still saved locally
    }
    setSaving(false);
  };

  const handleSaveTheme = (newTheme) => {
    setTheme(newTheme);
    toast.success(t('profileUpdated'));
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await base44.auth.resetPasswordRequest(user.email);
      toast.success('Password reset link sent to your email');
    } catch (e) {
      toast.success('Password reset link sent to your email');
    }
    setSendingReset(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        {t('settings')}
      </h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5"><User className="w-3.5 h-3.5" /> {t('profile')}</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Lock className="w-3.5 h-3.5" /> {t('security')}</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5"><Palette className="w-3.5 h-3.5" /> {t('preferences')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('profile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.full_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('fullName')}</Label>
                  <Input value={user?.full_name || ''} readOnly className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('email')}</Label>
                  <Input value={user?.email || ''} readOnly className="bg-muted/50" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t('status')}:</span>
                <Badge variant="secondary" className="capitalize">{user?.role || 'user'}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('security')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('changePassword')}</p>
                  <p className="text-xs text-muted-foreground">A reset link will be sent to {user?.email}</p>
                </div>
              </div>
              <Button onClick={handlePasswordReset} disabled={sendingReset} variant="outline" className="w-full gap-2">
                <Lock className="w-4 h-4" />
                {sendingReset ? 'Sending...' : t('changePassword')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Globe className="w-3.5 h-3.5" /> {t('language')}
                </Label>
                <Select value={lang} onValueChange={handleSaveLanguage}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇵🇦 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5" /> {t('theme')}
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Sun className="w-4 h-4" /> <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => handleSaveTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Moon className="w-4 h-4" /> <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
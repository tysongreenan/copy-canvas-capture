import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { GlobalKnowledgeService } from '@/services/GlobalKnowledgeService';
import { ProjectSettingsService } from '@/services/ProjectSettingsService';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

const WorkspaceSettings = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      setLoading(true);
      const cats = await GlobalKnowledgeService.getCategories();
      setCategories(cats);
      const settings = await ProjectSettingsService.getProjectSettings(id);
      setSelected(settings?.allowed_categories || []);
      setLoading(false);
    };
    load();
  }, [user, id]);

  const toggle = (catId: string) => {
    setSelected(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const updated = await ProjectSettingsService.updateProjectSettings(id, {
      allowedCategories: selected,
    });
    if (updated) {
      toast({ title: 'Settings Saved', description: 'Workspace categories updated.' });
    } else {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Workspace Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Global Knowledge Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p>Loading...</p>
            ) : (
              categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.includes(cat.id)}
                    onCheckedChange={() => toggle(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))
            )}
          </CardContent>
        </Card>
        <div className="mt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceSettings;

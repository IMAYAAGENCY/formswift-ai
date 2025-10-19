import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

interface AffiliateBanner {
  id: string;
  name: string;
  platform: string;
  banner_url: string;
  affiliate_link: string;
  display_location: string;
  page_category: string | null;
  is_active: boolean;
  display_order: number;
  total_clicks: number;
  created_at: string;
}

export default function AdminAffiliates() {
  const [banners, setBanners] = useState<AffiliateBanner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AffiliateBanner | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    platform: "AppSumo",
    banner_url: "",
    affiliate_link: "",
    display_location: "footer",
    page_category: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliate_banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load affiliate banners");
      console.error(error);
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      page_category: formData.page_category || null,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from("affiliate_banners")
        .update(dataToSave)
        .eq("id", editingBanner.id);

      if (error) {
        toast.error("Failed to update banner");
        console.error(error);
      } else {
        toast.success("Banner updated successfully");
        fetchBanners();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("affiliate_banners")
        .insert([dataToSave]);

      if (error) {
        toast.error("Failed to create banner");
        console.error(error);
      } else {
        toast.success("Banner created successfully");
        fetchBanners();
        resetForm();
      }
    }
  };

  const handleEdit = (banner: AffiliateBanner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      platform: banner.platform,
      banner_url: banner.banner_url,
      affiliate_link: banner.affiliate_link,
      display_location: banner.display_location,
      page_category: banner.page_category || "",
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    const { error } = await supabase
      .from("affiliate_banners")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete banner");
      console.error(error);
    } else {
      toast.success("Banner deleted successfully");
      fetchBanners();
    }
  };

  const toggleActive = async (banner: AffiliateBanner) => {
    const { error } = await supabase
      .from("affiliate_banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    if (error) {
      toast.error("Failed to update banner status");
      console.error(error);
    } else {
      toast.success(`Banner ${!banner.is_active ? "activated" : "deactivated"}`);
      fetchBanners();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      platform: "AppSumo",
      banner_url: "",
      affiliate_link: "",
      display_location: "footer",
      page_category: "",
      is_active: true,
      display_order: 0,
    });
    setEditingBanner(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Affiliate Banner Management</h1>
            <p className="text-muted-foreground">Manage third-party affiliate links and track performance</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Edit" : "Add"} Affiliate Banner</DialogTitle>
                <DialogDescription>
                  {editingBanner ? "Update" : "Create"} an affiliate banner to display on your platform
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Banner Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AppSumo Premium Tools"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AppSumo">AppSumo</SelectItem>
                      <SelectItem value="vCommission">vCommission</SelectItem>
                      <SelectItem value="ClickBank">ClickBank</SelectItem>
                      <SelectItem value="PartnerStack">PartnerStack</SelectItem>
                      <SelectItem value="ShareASale">ShareASale</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="banner_url">Banner Image URL</Label>
                  <Input
                    id="banner_url"
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="affiliate_link">Affiliate Link</Label>
                  <Input
                    id="affiliate_link"
                    type="url"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                    placeholder="https://affiliate-link.com/?ref=yourcode"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="display_location">Display Location</Label>
                  <Select
                    value={formData.display_location}
                    onValueChange={(value) => setFormData({ ...formData, display_location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="page-specific">Page Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="page_category">Page Category (Optional)</Label>
                  <Input
                    id="page_category"
                    value={formData.page_category}
                    onChange={(e) => setFormData({ ...formData, page_category: e.target.value })}
                    placeholder="e.g., dashboard, forms (leave empty for global)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for global display, or specify page name for targeted display
                  </p>
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBanner ? "Update" : "Create"} Banner
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Affiliate Banners</CardTitle>
            <CardDescription>Manage and track your affiliate marketing banners</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading banners...</p>
            ) : banners.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No affiliate banners yet. Click "Add Banner" to create one.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.name}</TableCell>
                      <TableCell>{banner.platform}</TableCell>
                      <TableCell className="capitalize">{banner.display_location}</TableCell>
                      <TableCell>{banner.page_category || "Global"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          {banner.total_clicks}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(banner)}
                        >
                          {banner.is_active ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(banner.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

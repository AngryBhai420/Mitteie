import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ItemModal({ item, onSave, onClose }) {
  const [navn, setNavn] = useState("");
  const [kategori, setKategori] = useState("");
  const [serienummer, setSerienummer] = useState("");
  const [notat, setNotat] = useState("");
  const [verdi, setVerdi] = useState("");
  const [vedlegg, setVedlegg] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setNavn(item.navn || "");
      setKategori(item.kategori || "");
      setSerienummer(item.serienummer || "");
      setNotat(item.notat || "");
      setVerdi(item.verdi ? String(item.verdi) : "");
      setVedlegg(item.vedlegg_urls || []);
    }
  }, [item]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        // Determine resource type
        const isPDF = file.type === "application/pdf";
        const resourceType = isPDF ? "raw" : "image";

        // Get signature
        const sigResponse = await fetch(
          `${BACKEND_URL}/api/cloudinary/signature?resource_type=${resourceType}`,
          { credentials: "include" }
        );

        if (!sigResponse.ok) throw new Error("Failed to get signature");

        const sig = await sigResponse.json();

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.api_key);
        formData.append("timestamp", sig.timestamp);
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        if (!uploadResponse.ok) throw new Error("Upload failed");

        const result = await uploadResponse.json();
        setVedlegg((prev) => [...prev, result.secure_url]);
      }

      toast.success("Fil(er) lastet opp");
    } catch (error) {
      toast.error("Opplasting mislyktes");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setVedlegg(vedlegg.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const itemData = {
      navn,
      kategori: kategori || null,
      serienummer: serienummer || null,
      notat: notat || null,
      verdi: verdi ? parseFloat(verdi) : null,
      valuta: "NOK",
      vedlegg_urls: vedlegg,
    };

    await onSave(itemData);
    setSaving(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-semibold">
            {item ? "Endre eiendel" : "Legg til i oversikten"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="navn" className="font-inter text-sm">
              Navn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="navn"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              required
              className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter"
              data-testid="item-navn-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori" className="font-inter text-sm">
              Kategori
            </Label>
            <Input
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              placeholder="F.eks. Elektronikk, Møbler, Smykker"
              className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter"
              data-testid="item-kategori-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serienummer" className="font-inter text-sm">
              Serienummer
            </Label>
            <Input
              id="serienummer"
              value={serienummer}
              onChange={(e) => setSerienummer(e.target.value)}
              className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter font-mono"
              data-testid="item-serienummer-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notat" className="font-inter text-sm">
              Notat
            </Label>
            <Textarea
              id="notat"
              value={notat}
              onChange={(e) => setNotat(e.target.value)}
              rows={3}
              className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter resize-none"
              data-testid="item-notat-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verdi" className="font-inter text-sm">
              Verdi (NOK)
            </Label>
            <Input
              id="verdi"
              type="number"
              step="0.01"
              value={verdi}
              onChange={(e) => setVerdi(e.target.value)}
              className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter"
              data-testid="item-verdi-input"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter text-sm">Vedlegg</Label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="w-full rounded-lg font-inter border-dashed"
                    onClick={() => document.getElementById("file-upload").click()}
                    data-testid="upload-attachment-btn"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Laster opp..." : "Last opp fil"}
                  </Button>
                </label>
              </div>

              {vedlegg.length > 0 && (
                <div className="space-y-2">
                  {vedlegg.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-sm font-inter truncate flex-1 mr-3">
                        Vedlegg {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttachment(index)}
                        className="rounded-full hover:bg-destructive/10"
                        data-testid={`remove-attachment-${index}`}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full font-inter"
              data-testid="cancel-item-btn"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={saving || !navn}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter"
              data-testid="save-item-btn"
            >
              {saving ? "Lagrer..." : item ? "Lagre endringer" : "Legg til"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

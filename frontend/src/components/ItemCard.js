import { Edit, Trash2, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ItemCard({ item, onEdit, onDelete }) {
  return (
    <div
      className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
      data-testid={`item-card-${item.item_id}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-playfair font-semibold text-foreground mb-1">
            {item.navn}
          </h3>
          {item.kategori && (
            <p className="text-sm text-muted-foreground font-inter">
              {item.kategori}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="rounded-full hover:bg-muted/50"
            data-testid={`edit-item-${item.item_id}`}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-destructive/10"
                data-testid={`delete-item-trigger-${item.item_id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-playfair">
                  Fjerne eiendel?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-inter">
                  Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full font-inter">
                  Avbryt
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full font-inter"
                  data-testid={`delete-item-confirm-${item.item_id}`}
                >
                  Fjern
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {item.serienummer && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground font-inter mb-1">
            Serienummer
          </p>
          <p className="text-sm text-foreground font-inter font-mono">
            {item.serienummer}
          </p>
        </div>
      )}

      {item.notat && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground font-inter mb-1">Notat</p>
          <p className="text-sm text-foreground font-inter">{item.notat}</p>
        </div>
      )}

      {item.verdi && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground font-inter mb-1">Verdi</p>
          <p className="text-lg font-playfair font-semibold text-foreground">
            {item.verdi.toLocaleString("nb-NO")} {item.valuta}
          </p>
        </div>
      )}

      {item.vedlegg_urls && item.vedlegg_urls.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-inter mb-2">
            Vedlegg ({item.vedlegg_urls.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {item.vedlegg_urls.map((url, index) => {
              const isPDF = url.toLowerCase().endsWith(".pdf");
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted text-sm font-inter"
                  data-testid={`attachment-${index}`}
                >
                  {isPDF ? (
                    <FileText className="h-4 w-4 mr-2" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Vedlegg {index + 1}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

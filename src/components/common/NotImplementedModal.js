// src/components/common/NotImplementedModal.js
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotImplementedModal({
  isOpen,
  onClose,
  title = "Fonctionnalité en développement",
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="pt-2 pb-4 text-center">
          Cette fonctionnalité est restreinte. Veuillez vous rapprocher de
          l'équipe support pour plus d'informations.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

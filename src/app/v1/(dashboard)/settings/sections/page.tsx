//src/app/v1/(dashboard)/settings/sections/page.tsx
"use client";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import { SectionTable } from "@/components/sections/SectionTable";
import { SectionForm } from "@/components/sections/SectionForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Section } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


const SectionsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [refresh, setRefresh] = useState(false); // Add a refresh state

  const handleEdit = (section: Section) => {
    setSelectedSection(section);
    setIsFormOpen(true);
  };

   const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedSection(null); // Clear selected section when dialog closes
    }
  };

  const handleSuccess = () => {
    // Toggle the flag to force UserTable to re-mount and fetch updated data
    setRefresh((prev) => !prev);
  };

  return (
    <ContentLayout title="Sections Management">
        <div className="flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
            <Button>Create Section</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:max-w-4xl">
            <DialogHeader>
                <DialogTitle>
                {selectedSection ? "Edit Section" : "Create Section"}
                </DialogTitle>
                <DialogDescription>
                {selectedSection
                    ? "Make changes to the section information."
                    : "Add a new section to the system."}
                </DialogDescription>
            </DialogHeader>
            <SectionForm
                section={selectedSection}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSuccess} // Pass the success callback
            />
            </DialogContent>
        </Dialog>
        </div>
      <SectionTable key={refresh.toString()} onEdit={handleEdit} />
    </ContentLayout>
  );
};

export default SectionsPage;
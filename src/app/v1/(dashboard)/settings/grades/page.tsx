// src/app/v1/(dashboard)/settings/grades/page.tsx
"use client";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import {GradeTable} from "@/components/grades/GradeTable";
import { GradeForm } from "@/components/grades/GradeForm";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Section } from "@prisma/client";
import { Grade } from "@/types/school_settings"; // Import YOUR custom Grade type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SkeletonTable } from "@/components/skeletons/SkeletonsUI";

const GradesPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null); // Use custom Grade type
    const [refresh, setRefresh] = useState(false);
    const [sections, setSections] = useState<Section[]>([])
    const [loading, setLoading] = useState(true)

    //Fetch Sections
    const fetchSections = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/v1/sections")
            if(!res.ok){
                throw new Error("Failed to fetch sections")
            }
            const data: Section[] = await res.json() // Use section type
            setSections(data)

        } catch (error) {
            console.error("Error fetching sections: ", error)
        }finally{
            setLoading(false)
        }
    }
     useEffect(() => {
       fetchSections()
    }, [])

    //--

  const handleEdit = (grade: Grade) => { // Use custom Grade Type
    setSelectedGrade(grade);
    setIsFormOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedGrade(null); // Clear selected grade when dialog closes
    }
  };
    const handleSuccess = () => {
        // Toggle the flag to force UserTable to re-mount and fetch updated data
        setRefresh((prev) => !prev);
    };

  if(loading) return <SkeletonTable />

  return (
    <ContentLayout title="Grades Management">
        <div className="flex justify-end mb-4">
            <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                <Button>Create Grade</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[425px] md:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                    {selectedGrade ? "Edit Grade" : "Create Grade"}
                    </DialogTitle>
                    <DialogDescription>
                    {selectedGrade
                        ? "Make changes to the grade information."
                        : "Add a new grade to the system."}
                    </DialogDescription>
                </DialogHeader>
                <GradeForm
                    grade={selectedGrade}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess} // Pass the success callback
                    sections={sections}
                />
                </DialogContent>
            </Dialog>
        </div>
      <GradeTable key={refresh.toString()} onEdit={handleEdit} />
    </ContentLayout>
  );
};

export default GradesPage;
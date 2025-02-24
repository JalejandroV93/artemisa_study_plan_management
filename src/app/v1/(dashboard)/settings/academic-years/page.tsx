"use client";
import { useState } from "react";
import { AcademicYearForm } from "@/components/academic-years/AcademicYearForm";
import { AcademicYearTable } from "@/components/academic-years/AcademicYearTable";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AcademicCalendarSettings, TrimesterSettings } from "@prisma/client";

type ExtendedAcademicYear = AcademicCalendarSettings & { trimesters: TrimesterSettings[] };

const AcademicYearsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<ExtendedAcademicYear | null>(null);
  const [refresh, setRefresh] = useState(false);

  const handleEdit = (year: ExtendedAcademicYear) => {
    setSelectedYear(year);
    setIsFormOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedYear(null);
    }
  };

  const handleSuccess = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <ContentLayout title="Academic Years">
      <div className="flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>Add Academic Year</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-4xl lg:max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {selectedYear ? "Edit Academic Year" : "Add Academic Year"}
              </DialogTitle>
              <DialogDescription>
                {selectedYear
                  ? "Make changes to the academic year."
                  : "Add a new academic year to the system."}
              </DialogDescription>
            </DialogHeader>
            <AcademicYearForm
              academicYear={selectedYear}
              onClose={() => setIsFormOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <AcademicYearTable key={refresh.toString()} onEdit={handleEdit} />
    </ContentLayout>
  );
};

export default AcademicYearsPage;
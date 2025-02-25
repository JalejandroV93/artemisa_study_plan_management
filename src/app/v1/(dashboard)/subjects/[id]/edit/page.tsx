// src/app/v1/(dashboard)/subjects/[id]/edit/page.tsx

"use client";

import { ContentLayout } from "@/components/panel-layout/content-layout";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import { Subject } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { SpiralLoader } from "@/components/ui/spiral-loader";
import { useAuth } from "@/components/providers/AuthProvider";

export default function EditSubjectPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast(); // Use the toast hook
  const {user} = useAuth()


    useEffect(() => {
        if(user?.role !== 'ADMIN'){
            toast({
            variant: "destructive",
            title: "Error",
            description: "You don't have permissions",
        });
        router.push("/v1/subjects")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

  useEffect(() => {
    const fetchSubject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/subjects/${id}`);
        if (!res.ok) {
            const errorData = await res.json(); // Get error details
            throw new Error(errorData.error || "Failed to fetch subject");
        }
        const data = await res.json();
        // Add default empty gradeOfferings property if it's missing
        const subjectWithGradeOfferings = { ...data, gradeOfferings: data.gradeOfferings ?? [] };
        setSubject(subjectWithGradeOfferings);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching subject:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to fetch subject data.",
          });
        router.push("/v1/subjects") // Redirect on error.

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleClose = () => {
    router.push(`/v1/subjects/${id}`); // Go back to the view page
  };

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex justify-center items-center h-full">
          <SpiralLoader /> {/* Or any other loading indicator */}
        </div>
      </ContentLayout>
    );
  }

  if (!subject) {
    return (
      <ContentLayout title="Not Found">
        <p>Subject not found.</p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Edit ${subject.name}`}>
      <SubjectForm subject={subject} onClose={handleClose} />
    </ContentLayout>
  );
}
// src/app/v1/(dashboard)/subjects/new/page.tsx
"use client";



import { useRouter } from "next/navigation";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import { SubjectForm } from "@/components/subjects/SubjectForm";


export default function NewSubjectPage() {

  const router = useRouter();

  const handleClose = () => {
    router.push("/v1/subjects"); // Go back to the list
  };

  return (
    <ContentLayout title="Create Subject">
        <SubjectForm onClose={handleClose}/>
    </ContentLayout>
  )
}
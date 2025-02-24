// src/app/v1/(dashboard)/settings/groups/page.tsx
"use client";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import { GroupTable } from "@/components/groups/GroupTable";
import { GroupForm } from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Group } from "@prisma/client"; // Correct type import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SkeletonTable } from "@/components/skeletons/SkeletonsUI";

const GroupsPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [grades, setGrades] = useState<{id: string, name: string, section:{name:string}}[]>([]) //
    const [loading, setLoading] = useState(true)

    const fetchGrades = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/v1/grades")
            if(!res.ok){
                throw new Error("Failed to fetch grades")
            }
            const data = await res.json()
            setGrades(data)

        } catch (error) {
            console.error("Error fetching grades: ", error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGrades()
    }, [])


    const handleEdit = (group: Group) => {
        setSelectedGroup(group);
        setIsFormOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setSelectedGroup(null); // Clear selected grade when dialog closes
        }
    };
    const handleSuccess = () => {
        // Toggle the flag to force UserTable to re-mount and fetch updated data
        setRefresh((prev) => !prev);
    };

    if(loading) return <SkeletonTable />

  return (
    <ContentLayout title="Groups Management">
        <div className="flex justify-end mb-4">
            <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                <Button>Create Group</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[425px] md:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                    {selectedGroup ? "Edit Group" : "Create Group"}
                    </DialogTitle>
                    <DialogDescription>
                    {selectedGroup
                        ? "Make changes to the group information."
                        : "Add a new group to the system."}
                    </DialogDescription>
                </DialogHeader>
                <GroupForm
                    group={selectedGroup}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess} // Pass the success callback
                    grades={grades}
                />
                </DialogContent>
            </Dialog>
        </div>
        <GroupTable key={refresh.toString()} onEdit={handleEdit} />
    </ContentLayout>
  );
};

export default GroupsPage;
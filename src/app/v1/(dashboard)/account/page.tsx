"use client";

import { ContentLayout } from "@/components/panel-layout/content-layout";
import { useAuth } from "@/components/providers/AuthProvider";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AccountPage = () => {
  const { user, isLoading, refetchUser } = useAuth();

  if (isLoading) return <Skeleton className="w-full h-[300px] rounded-lg" />;

  return (
    <ContentLayout title="Account Settings">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm user={user} refetchUser={refetchUser} />
        </TabsContent>
        <TabsContent value="password">
          <ChangePasswordForm refetchUser={refetchUser} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};

export default AccountPage;

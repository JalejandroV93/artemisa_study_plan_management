import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPayload } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProfileForm = ({
  user,
  refetchUser,
}: {
  user: UserPayload | null;
  refetchUser: () => void;
}) => {
  const [userData, setUserData] = useState<UserPayload | null>(user);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      if (!userData) {
        toast.error("No user data available.");
        return;
      }
      if (!userData.fullName || !userData.email) {
        toast.error("Name and email are required.");
        return;
      }

      const response = await fetch("/api/v1/users/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          phonenumber: userData.phonenumber,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully.");
        await refetchUser();
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update profile.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={userData?.avatarUrl || ""} alt={userData?.fullName || "User"} />
            <AvatarFallback>{userData?.fullName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userData?.fullName || "User Profile"}</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={userData?.username || ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={userData?.fullName || ""}
              onChange={(e) =>
                setUserData((prev) =>
                  prev ? { ...prev, fullName: e.target.value } : prev
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData?.email || ""}
              onChange={(e) =>
                setUserData((prev) =>
                  prev ? { ...prev, email: e.target.value } : prev
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phonenumber">Phone</Label>
            <Input
              id="phonenumber"
              type="tel"
              value={userData?.phonenumber || ""}
              onChange={(e) =>
                setUserData((prev) =>
                  prev ? { ...prev, phonenumber: e.target.value } : prev
                )
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdateProfile} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

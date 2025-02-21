// src/components/account/ChangePasswordForm.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Eye, EyeOff } from "lucide-react";

export const ChangePasswordForm = ({
  refetchUser,
}: {
  refetchUser: () => void;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // States to toggle visibility of each input
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  const handlePasswordChange = async () => {
    // Validaciones previas
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        description: "All password fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/v1/users/account/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast({
          description: "Password updated successfully.",
          variant: "default",
        });
        // Limpiar campos tras el éxito
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        await refetchUser();
      } else {
        const errorData = await response.json();
        toast({
          description: errorData.error || "Error changing password.",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        description: error.message || "Error changing password.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your current password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field: Current Password */}
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current Password</Label>
          <div className="relative">
            <Input
              id="current-password"
              name="current-password"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showCurrentPassword
                  ? "Hide password"
                  : "Show password"}
              </span>
            </Button>
          </div>
        </div>

        {/* Field: New Password */}
        <div className="grid gap-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              name="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showNewPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>

        {/* Field: Confirm New Password */}
        <div className="grid gap-2">
          <Label htmlFor="confirm-new-password">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              name="confirm-new-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePasswordChange}
          disabled={
            isSaving ||
            (!currentPassword && !newPassword && !confirmNewPassword)
          }
        >
          {isSaving ? "Saving..." : "Change Password"}
        </Button>
      </CardFooter>
    </Card>
  );
};
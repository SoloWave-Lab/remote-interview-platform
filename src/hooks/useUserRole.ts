'use client';

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/actions/user";

export const useUserRole = () => {
  const { user } = useAuth();
  const [roleData, setRoleData] = useState<{ isInterviewer: boolean; isCandidate: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const role = await getUserRole(user.id);
        setRoleData(role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    isLoading,
    isInterviewer: roleData?.isInterviewer ?? false,
    isCandidate: roleData?.isCandidate ?? false,
  };
};

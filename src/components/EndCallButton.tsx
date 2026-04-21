'use client';

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getInterviewByStreamCallId, updateInterviewStatus } from "@/lib/actions/interview";

function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!call?.id) {
      setLoading(false);
      return;
    }

    const fetchInterview = async () => {
      try {
        const data = await getInterviewByStreamCallId(call.id);
        setInterview(data);
      } catch (error) {
        console.error("Failed to fetch interview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [call?.id]);

  if (!call || !interview || loading) return null;

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    try {
      await call.endCall();

      await updateInterviewStatus(interview.id, "completed");

      router.push("/");
      toast.success("Meeting ended for everyone");
    } catch (error) {
      console.log(error);
      toast.error("Failed to end meeting");
    }
  };

  return (
    <Button variant={"destructive"} onClick={endCall}>
      End Meeting
    </Button>
  );
}
export default EndCallButton;

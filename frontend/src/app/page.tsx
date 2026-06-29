"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold tracking-tight mb-4">
            ⚡ Clutch
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Never miss what matters.
          </p>
          <p className="text-gray-500 text-sm">
            Your AI productivity companion that performs when it counts.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 text-center">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-2xl mb-1">🧠</div>
            <div className="text-sm font-medium">AI Planning</div>
            <div className="text-xs text-gray-500">Breaks goals into steps</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm font-medium">Smart Priority</div>
            <div className="text-xs text-gray-500">Ranks what matters most</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm font-medium">Auto Schedule</div>
            <div className="text-xs text-gray-500">Syncs to your calendar</div>
          </div>
        </div>

        <Button
          onClick={signIn}
          className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-xl font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Continue with Google →"}
        </Button>
      </div>
    </main>
  );
}
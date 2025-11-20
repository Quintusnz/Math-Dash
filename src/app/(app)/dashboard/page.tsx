"use client";

import { useState } from "react";
import { ProfileSwitcher } from "@/components/features/profiles/ProfileSwitcher";
import { ProfileCreator } from "@/components/features/profiles/ProfileCreator";
import { useUserStore } from "@/lib/stores/useUserStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MasteryTracker } from "@/lib/game-engine/mastery-tracker";
import Link from "next/link";
import dynamic from "next/dynamic";

const SkillRadar = dynamic(
  () => import("@/components/features/analytics/SkillRadar").then((mod) => mod.SkillRadar),
  { 
    loading: () => <div className="h-64 w-full animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
);

export default function DashboardPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { activeProfileId } = useUserStore();
  
  const activeProfile = useLiveQuery(
    async () => activeProfileId ? await db.profiles.get(activeProfileId) : null,
    [activeProfileId]
  );

  const radarData = useLiveQuery(
    async () => activeProfileId ? await MasteryTracker.getRadarData(activeProfileId) : undefined,
    [activeProfileId]
  );

  if (isCreating) {
    return (
      <div className="p-8">
        <button 
          onClick={() => setIsCreating(false)}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <ProfileCreator onCreated={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Math Dash</h1>
        {activeProfile && (
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">Hi, {activeProfile.displayName}!</span>
            <div className="flex gap-2">
              <Link 
                href="/play" 
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90"
              >
                Solo Dash
              </Link>
              <Link 
                href="/play/duel" 
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-full font-bold hover:opacity-90"
              >
                Duel Mode
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-6">Profiles</h2>
          <ProfileSwitcher onCreateNew={() => setIsCreating(true)} />
        </section>

        {activeProfile && (
          <section>
             <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
             <SkillRadar data={radarData} />
          </section>
        )}
      </main>
    </div>
  );
}

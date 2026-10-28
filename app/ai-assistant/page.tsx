"use client";

import React, { useState, useEffect } from "react";
import { getResources } from "@/lib/db";
import { Resource } from "@/types";
import AICoordinatorView from "@/components/ai/AICoordinatorView";

export default function AIAssistantPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getResources();
      setResources(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-campus-muted">
        <div className="w-8 h-8 rounded-full border-2 border-campus-cyan border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs">Initializing Gemini AI Lab Coordinator...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AICoordinatorView resources={resources} />
    </div>
  );
}

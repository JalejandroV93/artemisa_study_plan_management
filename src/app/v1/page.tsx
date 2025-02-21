"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ContentLayout } from "@/components/panel-layout/content-layout";

export default function Home() {
  return (
    <ContentLayout title="Dashboard -> En Desarrollo">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Study Plan Management</h1>
          <p className="text-gray-600 mt-2">Manage and organize your academic study plans</p>
        </div>
        <Link href="/subjects/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Subject
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Subjects</h3>
          <p className="text-gray-600 mb-4">Create and manage subject study plans</p>
          <Link href="/subjects">
            <Button variant="secondary" className="w-full">View Subjects</Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Grade Offerings</h3>
          <p className="text-gray-600 mb-4">Manage grade-specific content</p>
          <Link href="/grades">
            <Button variant="secondary" className="w-full">View Grades</Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Print Study Plans</h3>
          <p className="text-gray-600 mb-4">Generate printable study plan reports</p>
          <Link href="/print">
            <Button variant="secondary" className="w-full">Print Options</Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-gray-600 text-center py-4">No recent activity</p>
        </div>
      </div>
      </ContentLayout>
  );
}
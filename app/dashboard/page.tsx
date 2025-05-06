"use client"

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FileIcon, Clock, Plus, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSections: 0,
    totalPages: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!db) throw new Error("Firebase is not initialized");
        
        // Get total pages and sections
        const pagesCollection = collection(db, "pages");
        const pagesSnapshot = await getDocs(pagesCollection);
        const totalPages = pagesSnapshot.size;

        let totalSections = 0;
        pagesSnapshot.forEach((doc) => {
          const data = doc.data();
          const sections = data.sections || {};
          totalSections += Object.keys(sections).length;
        });

        // Get total users (placeholder for now)
        const totalUsers = 150;

        setStats({
          totalSections,
          totalPages,
          totalUsers,
        });

        // Fetch recent activities
        const activitiesQuery = query(
          collection(db, "activities"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as Activity[];
        setRecentActivity(activities);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'page_created':
        return `Created page "${activity.pageTitle}"`;
      case 'page_updated':
        return `Updated page "${activity.pageTitle}"`;
      case 'page_deleted':
        return `Deleted page "${activity.pageTitle}"`;
      case 'section_created':
        return `Added section "${activity.sectionTitle}" to "${activity.pageTitle}"`;
      case 'section_updated':
        return `Updated section "${activity.sectionTitle}" in "${activity.pageTitle}"`;
      case 'section_deleted':
        return `Deleted section "${activity.sectionTitle}" from "${activity.pageTitle}"`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={() => router.push('/dashboard/pages/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.totalPages}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of pages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.totalSections}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of content sections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest changes and updates to your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading activity...</div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{getActivityMessage(activity)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp && formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your CMS</CardTitle>
          <CardDescription>
            Manage your content from this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This CMS allows you to manage the content of your mobile
            application. You can create, edit, and delete sections, as well as
            manage clickable words and colored lines within each section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

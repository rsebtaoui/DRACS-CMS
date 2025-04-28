import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Manage your content sections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">App Settings</div>
            <p className="text-xs text-muted-foreground">
              Configure your application settings
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
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
    </div>
  );
}

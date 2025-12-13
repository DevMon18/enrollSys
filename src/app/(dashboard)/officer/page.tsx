import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileCheck, Clock, TrendingUp, Search, Filter, CheckCircle, XCircle, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function OfficerDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Officer Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and process student applications</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-[#800000] hover:bg-[#700000] text-white">
            Process All Pending
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                <p className="text-3xl font-bold text-[#800000] mt-1">12</p>
                <p className="text-xs text-emerald-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> +2 new today
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-[#800000]/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-[#800000]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reviewed Today</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">45</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileCheck className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">234</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approval Rate</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">92%</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search applications..." className="pl-10 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { name: "Maria Santos", id: "APP-2024-001", status: "pending", docs: "5/5" },
              { name: "Pedro Reyes", id: "APP-2024-002", status: "approved", docs: "5/5" },
              { name: "Ana Cruz", id: "APP-2024-003", status: "pending", docs: "4/5" },
              { name: "Jose Garcia", id: "APP-2024-004", status: "rejected", docs: "3/5" },
              { name: "Elena Flores", id: "APP-2024-005", status: "pending", docs: "5/5" },
            ].map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                    {app.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                    <p className="text-sm text-gray-500">{app.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-gray-500">Docs: {app.docs}</span>
                  <Badge variant="outline" className={
                    app.status === "approved" ? "border-emerald-500 text-emerald-700 bg-emerald-50" :
                    app.status === "rejected" ? "border-red-500 text-red-700 bg-red-50" :
                    "border-amber-500 text-amber-700 bg-amber-50"
                  }>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

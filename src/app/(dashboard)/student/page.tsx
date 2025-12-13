import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle2, AlertCircle, Upload, Calendar, BookOpen } from "lucide-react"

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-[#800000] to-[#900000] border-0 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Juan!</h1>
              <p className="text-white/80">Your enrollment is in progress. Complete the remaining requirements.</p>
            </div>
            <Button variant="secondary" className="bg-white text-[#800000] hover:bg-gray-100 shadow-lg">
              <Upload className="mr-2 h-4 w-4" /> Upload Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Status</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">Pending Review</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">4 of 5</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">3 Documents</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Action Required</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">1 Missing</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Checklist */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Document Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Birth Certificate", status: "approved" },
              { name: "High School Diploma", status: "approved" },
              { name: "Form 137", status: "pending" },
              { name: "Good Moral Certificate", status: "approved" },
              { name: "Medical Certificate", status: "missing" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{doc.name}</span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  doc.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  doc.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-[#800000]/20 bg-[#800000]/5">
              <div className="h-12 w-12 rounded-lg bg-[#800000] text-white flex flex-col items-center justify-center text-sm">
                <span className="font-bold">15</span>
                <span className="text-xs">Dec</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Document Submission Deadline</p>
                <p className="text-sm text-gray-500">Submit remaining requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center text-sm">
                <span className="font-bold">20</span>
                <span className="text-xs">Dec</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Enrollment Confirmation</p>
                <p className="text-sm text-gray-500">Final enrollment status release</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

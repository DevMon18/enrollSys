import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, ClipboardCheck, BookOpen, Calendar, Clock } from "lucide-react"

export default function FacultyDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your classes and student grades</p>
        </div>
        <Button className="bg-[#800000] hover:bg-[#700000] text-white">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Submit Grades
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">My Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">156</p>
                <p className="text-xs text-gray-500 mt-2">Across 5 sections</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-[#800000]/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-[#800000]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grades</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">24</p>
                <p className="text-xs text-gray-500 mt-2">Due in 5 days</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClipboardCheck className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Classes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">5</p>
                <p className="text-xs text-gray-500 mt-2">This semester</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { code: "IT101", name: "Introduction to Computing", section: "A", students: 35, schedule: "MWF 8:00-9:00 AM" },
              { code: "IT102", name: "Computer Programming 1", section: "B", students: 32, schedule: "TTH 10:00-11:30 AM" },
              { code: "IT103", name: "Computer Programming 2", section: "A", students: 28, schedule: "MWF 1:00-2:00 PM" },
              { code: "IT201", name: "Data Structures", section: "C", students: 30, schedule: "TTH 2:00-3:30 PM" },
              { code: "IT301", name: "Database Systems", section: "A", students: 31, schedule: "MWF 3:00-4:00 PM" },
            ].map((cls, i) => (
              <Card key={i} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-[#800000] text-white flex items-center justify-center font-bold text-sm">
                      {cls.section}
                    </div>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Users className="h-3 w-3 mr-1" /> {cls.students}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{cls.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{cls.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {cls.schedule}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#800000]" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "8:00 - 9:00 AM", subject: "IT101 - Introduction to Computing", room: "Room 201" },
              { time: "1:00 - 2:00 PM", subject: "IT103 - Computer Programming 2", room: "Lab 3" },
              { time: "3:00 - 4:00 PM", subject: "IT301 - Database Systems", room: "Room 305" },
            ].map((sched, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="text-center min-w-[100px]">
                  <p className="text-sm font-semibold text-[#800000]">{sched.time.split(' - ')[0]}</p>
                  <p className="text-xs text-gray-500">{sched.time.split(' - ')[1]}</p>
                </div>
                <div className="h-10 w-[2px] bg-[#800000]/20 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{sched.subject}</p>
                  <p className="text-sm text-gray-500">{sched.room}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient, type Profile, type Candidate } from "@/lib/supabase"
import { Users, FileSpreadsheet, CheckCircle, Clock, UserCheck, AlertCircle, TrendingUp, Activity } from "lucide-react"

interface DashboardStats {
  totalCandidates: number
  pendingCandidates: number
  approvedCandidates: number
  rejectedCandidates: number
  totalUsers: number
  adminCount: number
  officerCount: number
  facultyCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    pendingCandidates: 0,
    approvedCandidates: 0,
    rejectedCandidates: 0,
    totalUsers: 0,
    adminCount: 0,
    officerCount: 0,
    facultyCount: 0,
  })
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()
      
      try {
        // Fetch candidates
        const { data: candidates } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false })

        // Fetch profiles/users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')

        if (candidates) {
          setStats(prev => ({
            ...prev,
            totalCandidates: candidates.length,
            pendingCandidates: candidates.filter(c => c.status === 'pending').length,
            approvedCandidates: candidates.filter(c => c.status === 'approved').length,
            rejectedCandidates: candidates.filter(c => c.status === 'rejected').length,
          }))
          setRecentCandidates(candidates.slice(0, 5))
        }

        if (profiles) {
          setStats(prev => ({
            ...prev,
            totalUsers: profiles.length,
            adminCount: profiles.filter(p => p.role === 'admin').length,
            officerCount: profiles.filter(p => p.role === 'officer').length,
            facultyCount: profiles.filter(p => p.role === 'faculty').length,
          }))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      description: "All registered candidates",
      icon: FileSpreadsheet,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Pending Review",
      value: stats.pendingCandidates,
      description: "Awaiting verification",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "Approved",
      value: stats.approvedCandidates,
      description: "Successfully verified",
      icon: CheckCircle,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Rejected",
      value: stats.rejectedCandidates,
      description: "Needs attention",
      icon: AlertCircle,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  ]

  const userCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-[#800000]",
    },
    {
      title: "Admins",
      value: stats.adminCount,
      icon: UserCheck,
      color: "text-purple-600",
    },
    {
      title: "Officers",
      value: stats.officerCount,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Faculty",
      value: stats.facultyCount,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of the enrollment system.
        </p>
      </div>

      {/* Candidate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border-0 shadow-lg ${stat.bgColor} overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Stats & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Stats */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#800000]" />
              User Statistics
            </CardTitle>
            <CardDescription>System user breakdown by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {userCards.map((user) => (
                <div key={user.title} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <user.icon className={`h-5 w-5 ${user.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.value}</p>
                      <p className="text-xs text-gray-500">{user.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#800000]" />
              Recent Candidates
            </CardTitle>
            <CardDescription>Latest candidate applications</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No candidates yet. Upload a CSV to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center text-white font-bold text-sm">
                        {candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{candidate.full_name}</p>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      candidate.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : candidate.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

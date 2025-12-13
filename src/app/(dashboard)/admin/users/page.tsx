"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient, type Profile } from "@/lib/supabase"
import { 
  Search, Users, UserCog, GraduationCap, Briefcase, Shield,
  MoreHorizontal, RefreshCw, Edit, Trash2, X, Save
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-700' },
  { value: 'officer', label: 'Officer', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { value: 'faculty', label: 'Faculty', icon: GraduationCap, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'student', label: 'Student', icon: Users, color: 'bg-amber-100 text-amber-700' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    role: "student" as Profile['role'],
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        u =>
          (u.full_name?.toLowerCase() || '').includes(query) ||
          u.email.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, users])

  // Update user role
  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    const supabase = createClient()
    setSaving(true)
    setFormError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
        })
        .eq('id', editingUser.id)

      if (error) throw error

      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Quick role update
  const handleQuickRoleUpdate = async (userId: string, newRole: Profile['role']) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating role:', error)
      alert(`Error updating role: ${error.message}`)
    }
  }

  // Delete user profile (note: this only deletes the profile, not the auth user)
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user profile? This will not delete the authentication account.')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(`Error deleting user: ${error.message}`)
    }
  }

  // Open edit modal
  const openEditModal = (user: Profile) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name || "",
      role: user.role,
    })
    setShowEditModal(true)
  }

  // Role stats
  const roleStats = ROLES.map(role => ({
    ...role,
    count: users.filter(u => u.role === role.value).length,
  }))

  const getRoleBadge = (role: Profile['role']) => {
    const roleConfig = ROLES.find(r => r.value === role)
    return roleConfig ? (
      <Badge className={`${roleConfig.color} hover:${roleConfig.color}`}>
        {roleConfig.label}
      </Badge>
    ) : (
      <Badge variant="secondary">{role}</Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage system users and their roles
        </p>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roleStats.map((role) => (
          <Card 
            key={role.value} 
            className={`border-0 shadow-md cursor-pointer transition-all hover:shadow-lg ${
              roleFilter === role.value ? 'ring-2 ring-[#800000]' : ''
            }`}
            onClick={() => setRoleFilter(roleFilter === role.value ? 'all' : role.value)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${role.color.split(' ')[0]} flex items-center justify-center`}>
                <role.icon className={`h-5 w-5 ${role.color.split(' ')[1]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{role.count}</p>
                <p className="text-xs text-gray-500">{role.label}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-[#800000]" />
                System Users
              </CardTitle>
              <CardDescription>All registered users in the system</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchUsers}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center text-white font-bold text-sm">
                            {(user.full_name || user.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.full_name || 'No name set'}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleQuickRoleUpdate(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="h-4 w-4 mr-2 text-purple-600" /> Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleQuickRoleUpdate(user.id, 'officer')}
                              disabled={user.role === 'officer'}
                            >
                              <Briefcase className="h-4 w-4 mr-2 text-blue-600" /> Set as Officer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleQuickRoleUpdate(user.id, 'faculty')}
                              disabled={user.role === 'faculty'}
                            >
                              <GraduationCap className="h-4 w-4 mr-2 text-emerald-600" /> Set as Faculty
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleQuickRoleUpdate(user.id, 'student')}
                              disabled={user.role === 'student'}
                            >
                              <Users className="h-4 w-4 mr-2 text-amber-600" /> Set as Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update user information and role</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setShowEditModal(false); setEditingUser(null); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Email (cannot be changed)</p>
                <p className="font-medium">{editingUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Juan Dela Cruz"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: Profile['role']) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="h-4 w-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#800000] hover:bg-[#600000]"
                  onClick={handleUpdateUser}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

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
import { createClient, type Candidate } from "@/lib/supabase"
import { CSVUploader } from "@/components/admin/csv-uploader"
import { 
  Search, Plus, Edit, Trash2, Mail, MoreHorizontal, 
  FileSpreadsheet, CheckCircle, XCircle, Clock, RefreshCw,
  X, Save, Send
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [formData, setFormData] = useState({
    application_no: "",
    full_name: "",
    email: "",
    contact_number: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchCandidates = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCandidates(data || [])
      setFilteredCandidates(data || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Filter candidates based on search and status
  useEffect(() => {
    let filtered = candidates

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        c =>
          c.full_name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.application_no.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "invited") {
        filtered = filtered.filter(c => c.invited_at !== null)
      } else if (statusFilter === "not_sent") {
        filtered = filtered.filter(c => c.invited_at === null)
      } else {
        filtered = filtered.filter(c => c.status === statusFilter)
      }
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, statusFilter, candidates])

  // Handle CSV upload
  const handleCSVUpload = async (data: Record<string, string>[]) => {
    const supabase = createClient()
    
    // Map CSV data to candidate format
    const candidatesToInsert = data.map((row, index) => ({
      application_no: row.application_no || row['application no'] || `APP-${Date.now()}-${index}`,
      full_name: row.full_name || row['full name'] || row.name || 'Unknown',
      email: row.email || row['personal_email'] || '',
      contact_number: row.contact_number || row['contact number'] || row.phone || null,
      status: 'pending' as const,
    })).filter(c => c.email) // Filter out entries without email

    if (candidatesToInsert.length === 0) {
      alert('No valid candidates found in CSV. Make sure the CSV has email column.')
      return
    }

    try {
      const { error } = await supabase
        .from('candidates')
        .insert(candidatesToInsert)

      if (error) throw error
      
      fetchCandidates() // Refresh the list
    } catch (error: any) {
      console.error('Error inserting candidates:', error)
      alert(`Error importing candidates: ${error.message}`)
    }
  }

  // Add/Edit candidate
  const handleSaveCandidate = async () => {
    const supabase = createClient()
    setSaving(true)
    setFormError(null)

    try {
      if (editingCandidate) {
        // Update existing
        const { error } = await supabase
          .from('candidates')
          .update({
            application_no: formData.application_no,
            full_name: formData.full_name,
            email: formData.email,
            contact_number: formData.contact_number || null,
          })
          .eq('id', editingCandidate.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('candidates')
          .insert({
            application_no: formData.application_no || `APP-${Date.now()}`,
            full_name: formData.full_name,
            email: formData.email,
            contact_number: formData.contact_number || null,
            status: 'pending',
          })

        if (error) throw error
      }

      setShowAddModal(false)
      setEditingCandidate(null)
      setFormData({ application_no: "", full_name: "", email: "", contact_number: "" })
      fetchCandidates()
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete candidate
  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCandidates()
    } catch (error: any) {
      console.error('Error deleting candidate:', error)
      alert(`Error deleting candidate: ${error.message}`)
    }
  }

  // Update candidate status
  const handleUpdateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      fetchCandidates()
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(`Error updating status: ${error.message}`)
    }
  }

  // Send invitation via API
  const handleSendInvitation = async (candidate: Candidate) => {
    if (!confirm(`Send invitation email to ${candidate.email}?`)) return
    
    try {
      const response = await fetch('/api/admin/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details?.message || 'Failed to send invitation')
      }

      if (result.emailSent) {
        alert(`Invitation sent successfully to: ${candidate.email}`)
      } else {
        // Fallback for Resend limits
        const copy = confirm(`Email could not be delivered (Resend limit). Copy manual link?\n\n${result.activationUrl}`)
        if (copy) {
          navigator.clipboard.writeText(result.activationUrl)
          alert('Link copied to clipboard!')
        }
      }
      
      fetchCandidates()
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      alert(`Error sending invitation: ${error.message}`)
    }
  }

  // Open edit modal
  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setFormData({
      application_no: candidate.application_no,
      full_name: candidate.full_name,
      email: candidate.email,
      contact_number: candidate.contact_number || "",
    })
    setShowAddModal(true)
  }

  // Stats
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    approved: candidates.filter(c => c.status === 'approved').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Candidate Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage candidate enrollees and send invitations
          </p>
        </div>
        <Button 
          onClick={() => { setShowAddModal(true); setEditingCandidate(null); setFormData({ application_no: "", full_name: "", email: "", contact_number: "" }); }}
          className="bg-[#800000] hover:bg-[#600000] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Upload Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-[#800000] via-[#700000] to-[#600000] text-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">Import Candidates via CSV</CardTitle>
          <CardDescription className="text-white/70">
            Upload a CSV file with columns: application_no, full_name, email, contact_number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CSVUploader onUpload={handleCSVUpload} />
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Candidates List</CardTitle>
              <CardDescription>All registered candidate enrollees</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not_sent">Not sent</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchCandidates}>
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
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No candidates found</p>
              <p className="text-sm mt-1">Upload a CSV or add candidates manually</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead>Application #</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">{candidate.application_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center text-white font-bold text-xs">
                            {candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          {candidate.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.contact_number || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            candidate.status === 'approved' ? 'default' :
                            candidate.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className={
                            candidate.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                              : candidate.status === 'rejected'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {candidate.invited_at ? (
                          <span className="text-emerald-600 text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Sent
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not sent</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(candidate)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendInvitation(candidate)}>
                              <Send className="h-4 w-4 mr-2" /> Send Invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStatus(candidate.id, 'approved')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(candidate.id, 'rejected')}>
                              <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</CardTitle>
                <CardDescription>
                  {editingCandidate ? 'Update candidate information' : 'Enter candidate details'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setShowAddModal(false); setEditingCandidate(null); }}
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
              <div className="space-y-2">
                <Label htmlFor="app_no">Application Number</Label>
                <Input
                  id="app_no"
                  placeholder="APP-2024-001"
                  value={formData.application_no}
                  onChange={(e) => setFormData({ ...formData, application_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Juan Dela Cruz"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="+63 912 345 6789"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowAddModal(false); setEditingCandidate(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#800000] hover:bg-[#600000] text-white"
                  onClick={handleSaveCandidate}
                  disabled={saving || !formData.full_name || !formData.email}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCandidate ? 'Update' : 'Add'} Candidate
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

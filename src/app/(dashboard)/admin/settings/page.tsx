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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient, type Subject, type RequiredDocument } from "@/lib/supabase"
import { 
  Settings, BookOpen, FileText, Plus, Edit, Trash2, 
  RefreshCw, X, Save, GraduationCap, UserPlus
} from "lucide-react"

export default function SettingsPage() {
  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [subjectForm, setSubjectForm] = useState({ code: "", title: "", units: 3 })
  
  // Documents state
  const [documents, setDocuments] = useState<RequiredDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [showDocModal, setShowDocModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<RequiredDocument | null>(null)
  const [docForm, setDocForm] = useState({ 
    name: "", 
    student_type: "freshman" as RequiredDocument['student_type'] 
  })
  
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    const supabase = createClient()
    setLoadingSubjects(true)
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('code', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoadingSubjects(false)
    }
  }, [])

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    const supabase = createClient()
    setLoadingDocs(true)
    
    try {
      const { data, error } = await supabase
        .from('required_documents')
        .select('*')
        .order('student_type', { ascending: true })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    fetchSubjects()
    fetchDocuments()
  }, [fetchSubjects, fetchDocuments])

  // ====== SUBJECTS CRUD ======
  const handleSaveSubject = async () => {
    const supabase = createClient()
    setSaving(true)
    setFormError(null)

    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            code: subjectForm.code,
            title: subjectForm.title,
            units: subjectForm.units,
          })
          .eq('id', editingSubject.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({
            code: subjectForm.code,
            title: subjectForm.title,
            units: subjectForm.units,
          })

        if (error) throw error
      }

      setShowSubjectModal(false)
      setEditingSubject(null)
      setSubjectForm({ code: "", title: "", units: 3 })
      fetchSubjects()
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSubjects()
    } catch (error: any) {
      console.error('Error deleting subject:', error)
      alert(`Error deleting subject: ${error.message}`)
    }
  }

  const openSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject)
      setSubjectForm({
        code: subject.code,
        title: subject.title,
        units: subject.units,
      })
    } else {
      setEditingSubject(null)
      setSubjectForm({ code: "", title: "", units: 3 })
    }
    setFormError(null)
    setShowSubjectModal(true)
  }

  // ====== DOCUMENTS CRUD ======
  const handleSaveDocument = async () => {
    const supabase = createClient()
    setSaving(true)
    setFormError(null)

    try {
      if (editingDoc) {
        const { error } = await supabase
          .from('required_documents')
          .update({
            name: docForm.name,
            student_type: docForm.student_type,
          })
          .eq('id', editingDoc.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('required_documents')
          .insert({
            name: docForm.name,
            student_type: docForm.student_type,
          })

        if (error) throw error
      }

      setShowDocModal(false)
      setEditingDoc(null)
      setDocForm({ name: "", student_type: "freshman" })
      fetchDocuments()
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document requirement?')) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('required_documents')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchDocuments()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      alert(`Error deleting document: ${error.message}`)
    }
  }

  const openDocModal = (doc?: RequiredDocument) => {
    if (doc) {
      setEditingDoc(doc)
      setDocForm({
        name: doc.name,
        student_type: doc.student_type,
      })
    } else {
      setEditingDoc(null)
      setDocForm({ name: "", student_type: "freshman" })
    }
    setFormError(null)
    setShowDocModal(true)
  }

  // Filter documents by type
  const freshmanDocs = documents.filter(d => d.student_type === 'freshman')
  const transfereeDocs = documents.filter(d => d.student_type === 'transferee')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#800000]" />
          System Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure subjects, documents, and system requirements
        </p>
      </div>

      <Tabs defaultValue="subjects" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Required Documents
          </TabsTrigger>
        </TabsList>

        {/* SUBJECTS TAB */}
        <TabsContent value="subjects">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#800000]" />
                    Subject List
                  </CardTitle>
                  <CardDescription>
                    Manage available subjects for enrollment
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={fetchSubjects}>
                    <RefreshCw className={`h-4 w-4 ${loadingSubjects ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    onClick={() => openSubjectModal()}
                    className="bg-[#800000] hover:bg-[#600000]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No subjects configured</p>
                  <p className="text-sm mt-1">Add subjects for student enrollment</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center">Units</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {subject.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{subject.title}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              {subject.units} units
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openSubjectModal(subject)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Summary */}
              {subjects.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Subjects: <strong>{subjects.length}</strong>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Units: <strong>{subjects.reduce((sum, s) => sum + s.units, 0)}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#800000]" />
                    Required Documents
                  </CardTitle>
                  <CardDescription>
                    Configure required documents by student type
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={fetchDocuments}>
                    <RefreshCw className={`h-4 w-4 ${loadingDocs ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    onClick={() => openDocModal()}
                    className="bg-[#800000] hover:bg-[#600000]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No document requirements configured</p>
                  <p className="text-sm mt-1">Add required documents for student verification</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Freshman Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Freshman</h3>
                        <p className="text-xs text-gray-500">{freshmanDocs.length} documents</p>
                      </div>
                    </div>
                    {freshmanDocs.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No documents for freshmen</p>
                    ) : (
                      freshmanDocs.map((doc, index) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{doc.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDocModal(doc)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Transferee Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Transferee</h3>
                        <p className="text-xs text-gray-500">{transfereeDocs.length} documents</p>
                      </div>
                    </div>
                    {transfereeDocs.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No documents for transferees</p>
                    ) : (
                      transfereeDocs.map((doc, index) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{doc.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDocModal(doc)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <CardTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
                <CardDescription>
                  {editingSubject ? 'Update subject details' : 'Enter subject information'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setShowSubjectModal(false); setEditingSubject(null); }}
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
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  placeholder="CS 101"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Subject Title *</Label>
                <Input
                  id="title"
                  placeholder="Introduction to Computer Science"
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units *</Label>
                <Select 
                  value={subjectForm.units.toString()} 
                  onValueChange={(value) => setSubjectForm({ ...subjectForm, units: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(unit => (
                      <SelectItem key={unit} value={unit.toString()}>{unit} unit{unit > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowSubjectModal(false); setEditingSubject(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#800000] hover:bg-[#600000]"
                  onClick={handleSaveSubject}
                  disabled={saving || !subjectForm.code || !subjectForm.title}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingSubject ? 'Update' : 'Add'} Subject
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <CardTitle>{editingDoc ? 'Edit Document' : 'Add Required Document'}</CardTitle>
                <CardDescription>
                  {editingDoc ? 'Update document requirement' : 'Enter document details'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setShowDocModal(false); setEditingDoc(null); }}
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
                <Label htmlFor="docName">Document Name *</Label>
                <Input
                  id="docName"
                  placeholder="e.g., PSA Birth Certificate"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentType">Student Type *</Label>
                <Select 
                  value={docForm.student_type} 
                  onValueChange={(value: RequiredDocument['student_type']) => setDocForm({ ...docForm, student_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freshman">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                        Freshman
                      </div>
                    </SelectItem>
                    <SelectItem value="transferee">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        Transferee
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowDocModal(false); setEditingDoc(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#800000] hover:bg-[#600000]"
                  onClick={handleSaveDocument}
                  disabled={saving || !docForm.name}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingDoc ? 'Update' : 'Add'} Document
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

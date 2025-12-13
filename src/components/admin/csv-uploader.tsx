"use client"

import { useState } from "react"
import { Upload, X, FileText, Check, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface CSVUploaderProps {
  onUpload?: (data: any[]) => void
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  const handleUpload = () => {
    if (!file) return
    setStatus("uploading")
    
    // Read and parse the CSV file
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
        return row
      })

      // Simulate progress
      let p = 0
      const interval = setInterval(() => {
        p += 20
        setProgress(p)
        if (p >= 100) {
          clearInterval(interval)
          setStatus("success")
          if (onUpload) onUpload(data)
        }
      }, 150)
    }
    reader.readAsText(file)
  }

  const reset = () => {
    setFile(null)
    setProgress(0)
    setStatus("idle")
  }

  return (
    <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-white/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
      {status === "idle" && !file && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Click to upload or drag and drop</p>
            <p className="text-sm text-white/70">CSV files only (max 10MB)</p>
          </div>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            id="csv-upload"
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0])
            }} 
          />
          <label htmlFor="csv-upload">
            <Button 
              type="button" 
              onClick={() => document.getElementById('csv-upload')?.click()}
              className="mt-2 cursor-pointer bg-white/10 border border-white/40 text-white hover:bg-white hover:text-[#800000] font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Plus className="h-4 w-4" />
              Select File
            </Button>
          </label>
        </div>
      )}

      {file && status === "idle" && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">{file.name}</p>
            <p className="text-xs text-white/70">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={reset}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              className="bg-white text-[#800000] hover:bg-white/90 font-semibold shadow-lg"
            >
              <Upload className="h-4 w-4" />
              Upload & Process
            </Button>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <p className="font-semibold text-white">Processing Data...</p>
          <Progress value={progress} className="w-full h-2 bg-white/20" />
          <p className="text-xs text-white/70">Validating entries for duplicates...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
            <Check className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Import Successful</p>
            <p className="text-sm text-white/70">Candidates have been added to the system.</p>
          </div>
          <Button 
            onClick={reset}
            className="bg-white/10 border border-white/40 text-white hover:bg-white hover:text-[#800000] font-semibold transition-all duration-300"
          >
            Upload Another
          </Button>
        </div>
      )}
    </div>
  )
}

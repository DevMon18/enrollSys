"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ConnectionTestPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    const testConnection = async () => {
      // 1. Check Env Vars
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setConfig({
        url_defined: !!url,
        url_value: url, // CAREFUL: Only for debugging, don't show full key
        key_defined: !!key,
        key_length: key?.length || 0
      })

      if (!url || !key) {
        setStatus('error')
        setErrorMessage('Missing Environment Variables. Check .env.local')
        return
      }

      // 2. Client Creation
      const supabase = createBrowserClient(url, key)

      try {
        // 3. Simple Fetch Test (Fetching auth settings is a lightweight public endpoint)
        console.log('Testing connection to:', url)
        
        // We'll try to fetch the table structure or just a simple auth check
        const start = performance.now()
        // We test a simple RPC or just database health check if possible, 
        // fallback to just checking if we can instantiate auth
        const { error } = await supabase.from('profiles').select('count').limit(1).maybeSingle()
        
        const duration = performance.now() - start

        if (error) {
           // It's okay if table doesn't exist or RLS blocks, 
           // but 'TypeError: Failed to fetch' is the network error we are looking for
           if (error.message.includes('fetch')) {
             throw error
           }
           console.log('Database returned error (but network worked):', error)
        }
        
        setStatus('success')
        setErrorMessage(`Connected in ${duration.toFixed(0)}ms`)

      } catch (err: any) {
        console.error('Connection failed:', err)
        setStatus('error')
        setErrorMessage(err.message || 'Unknown network error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Supabase Connection Diagnostics</h2>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-500">Configuration</h3>
            <div className="text-xs bg-gray-100 p-3 rounded font-mono space-y-1">
              <p>URL Configured: <span className={config.url_defined ? 'text-green-600' : 'text-red-600'}>{config.url_defined ? 'YES' : 'NO'}</span></p>
              <p className="break-all">URL Value: {config.url_value || 'N/A'}</p>
              <p>Key Configured: <span className={config.key_defined ? 'text-green-600' : 'text-red-600'}>{config.key_defined ? 'YES' : 'NO'}</span></p>
              <p>Key Length: {config.key_length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-500">Connection Status</h3>
            {status === 'checking' && (
              <div className="p-4 bg-blue-50 text-blue-700 rounded-md flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking connection...</span>
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start gap-2">
                <XCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Connection Failed</p>
                  <p className="font-mono text-xs mt-1 break-all">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

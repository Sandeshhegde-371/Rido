'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CheckCircle, Upload, Image as ImageIcon, FileText, Settings, DollarSign, Rocket, ChevronRight } from 'lucide-react'

export default function ResourceWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  
  // Data State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    cover_image: '',
    pdf_url: '',
    title: '',
    description: '',
    category_id: '',
    price: '',
    is_premium: true,
    is_active: true
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'covers' | 'pdfs', field: 'cover_image' | 'pdf_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    
    if (error) {
      alert(`Upload failed: ${error.message}`)
      setIsUploading(false)
      return
    }

    if (bucket === 'covers') {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
      setFormData(prev => ({ ...prev, [field]: publicUrl }))
    } else {
      // For PDFs, we just store the path or URL. We will store the path.
      setFormData(prev => ({ ...prev, [field]: data.path }))
    }
    setIsUploading(false)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    const { error } = await supabase.from('resources').insert({
      title: formData.title,
      description: formData.description,
      category_id: formData.category_id,
      cover_image: formData.cover_image,
      pdf_url: formData.pdf_url,
      price: Number(formData.price),
      is_premium: formData.is_premium,
      is_active: formData.is_active
    })

    if (error) {
      alert(`Publish failed: ${error.message}`)
      setIsPublishing(false)
    } else {
      router.push('/admin/resources')
    }
  }

  const steps = [
    { icon: ImageIcon, title: 'Cover' },
    { icon: FileText, title: 'PDF' },
    { icon: Settings, title: 'Details' },
    { icon: DollarSign, title: 'Pricing' },
    { icon: Rocket, title: 'Publish' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Resource Wizard</h1>
        <p className="text-muted-foreground">Publish a new handbook in under 30 seconds.</p>
      </div>

      <div className="flex items-center justify-between relative max-w-2xl mx-auto mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = step >= i + 1
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 border-background transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
            </div>
          )
        })}
      </div>

      <Card className="glassmorphism max-w-2xl mx-auto border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        
        {step === 1 && (
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Upload Cover Image</h2>
              <p className="text-muted-foreground">This is the first thing students will see.</p>
            </div>
            
            <div className="flex justify-center">
              {formData.cover_image ? (
                <div className="relative rounded-xl overflow-hidden aspect-[3/4] w-48 border border-border">
                  <img src={formData.cover_image} alt="Cover" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Label htmlFor="cover-upload" className="cursor-pointer text-white font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Replace
                    </Label>
                  </div>
                </div>
              ) : (
                <Label htmlFor="cover-upload" className="flex flex-col items-center justify-center aspect-[3/4] w-48 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-2" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Click to upload</span>
                </Label>
              )}
              <Input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'covers', 'cover_image')} disabled={isUploading} />
            </div>

            <div className="flex justify-end pt-4">
              <Button disabled={!formData.cover_image || isUploading} onClick={() => setStep(2)}>Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        )}

        {step === 2 && (
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Upload PDF</h2>
              <p className="text-muted-foreground">The core content of your resource.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              {formData.pdf_url ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 w-full justify-center">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">PDF Uploaded Successfully</span>
                </div>
              ) : (
                <Label htmlFor="pdf-upload" className="flex flex-col items-center justify-center p-12 w-full rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <FileText className="h-10 w-10 text-muted-foreground group-hover:text-primary mb-4" />
                  <span className="text-lg font-medium text-muted-foreground group-hover:text-primary">Select PDF File</span>
                  {isUploading && <span className="mt-4 text-primary animate-pulse font-medium">Uploading to secure vault...</span>}
                </Label>
              )}
              <Input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdfs', 'pdf_url')} disabled={isUploading} />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!formData.pdf_url || isUploading} onClick={() => setStep(3)}>Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        )}

        {step === 3 && (
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Metadata</h2>
              <p className="text-muted-foreground">Title, description, and categorization.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. System Design Handbook" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background/50" />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="A brief overview of what this contains..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background/50 resize-none h-24" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="" disabled>Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={!formData.title || !formData.category_id} onClick={() => setStep(4)}>Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        )}

        {step === 4 && (
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Pricing Options</h2>
              <p className="text-muted-foreground">Determine how students access this.</p>
            </div>
            
            <div className="space-y-4 bg-background/50 p-6 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Premium Resource</Label>
                  <p className="text-sm text-muted-foreground">Requires payment to access.</p>
                </div>
                <Switch checked={formData.is_premium} onCheckedChange={(checked) => setFormData({...formData, is_premium: checked})} />
              </div>

              {formData.is_premium && (
                <div className="pt-4 border-t border-border/50 space-y-2">
                  <Label>Price (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="39" className="pl-9 bg-background" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button disabled={formData.is_premium && !formData.price} onClick={() => setStep(5)}>Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        )}

        {step === 5 && (
          <CardContent className="pt-6 text-center space-y-6">
            <Rocket className="h-24 w-24 mx-auto text-primary animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Ready to Launch!</h2>
              <p className="text-muted-foreground">Your resource will be instantly available to students.</p>
            </div>

            <div className="bg-card/50 p-4 rounded-xl border border-border/50 text-left space-y-2 inline-block min-w-[250px]">
              <p><span className="text-muted-foreground">Title:</span> {formData.title}</p>
              <p><span className="text-muted-foreground">Access:</span> {formData.is_premium ? `Premium (₹${formData.price})` : 'Free'}</p>
              <p><span className="text-muted-foreground">Files:</span> Attached <CheckCircle className="inline h-4 w-4 text-green-500 ml-1" /></p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(4)}>Back</Button>
              <Button size="lg" className="w-full sm:w-auto" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? 'Publishing...' : 'Publish Resource'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

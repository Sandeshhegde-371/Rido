'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, DollarSign, Loader2, Package } from 'lucide-react'
import { createBundle } from '@/app/actions/bundles'

export default function NewBundleWizard() {
  const router = useRouter()
  const supabase = createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resources, setResources] = useState<any[]>([])
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')

  useEffect(() => {
    async function fetchResources() {
      const { data } = await supabase.from('resources').select('id, title, price').eq('is_active', true)
      if (data) setResources(data)
    }
    fetchResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    
    const { data, error } = await supabase.storage.from('covers').upload(fileName, file)
    
    if (error) {
      alert(`Upload failed: ${error.message}`)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(data.path)
      setCoverUrl(publicUrl)
    }
    setIsUploading(false)
  }

  const handleSubmit = async (formData: FormData) => {
    if (selectedResources.length === 0) {
      alert('Please select at least one resource for the bundle.')
      return
    }
    setIsPublishing(true)
    try {
      formData.set('cover_image', coverUrl)
      await createBundle(formData, selectedResources)
      router.push('/admin/bundles')
    } catch (e: unknown) {
      alert(`Failed: ${(e as Error).message}`)
      setIsPublishing(false)
    }
  }

  const toggleResource = (id: string) => {
    setSelectedResources(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const totalValue = resources.filter(r => selectedResources.includes(r.id)).reduce((acc, r) => acc + (r.price || 0), 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Bundle</h1>
        <p className="text-muted-foreground">Combine resources and offer them at a discounted price.</p>
      </div>

      <Card className="glassmorphism border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Bundle Details</CardTitle>
          <CardDescription>Configure the bundle metadata and contents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bundle Name</Label>
                  <Input name="name" required placeholder="e.g. The Ultimate Placement Kit" className="bg-background/50" />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="A brief overview..." className="bg-background/50 resize-none h-24" />
                </div>

                <div className="space-y-2">
                  <Label>Bundle Price (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" name="price" required placeholder="999" className="pl-9 bg-background/50" />
                  </div>
                  {selectedResources.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Individual items combined value: <span className="font-bold line-through text-destructive">₹{totalValue}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  {coverUrl ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} alt="Cover" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Label htmlFor="cover-upload" className="cursor-pointer text-white font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Replace
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="cover-upload" className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload Cover</span>
                    </Label>
                  )}
                  <Input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </div>
              </div>

              {/* Right Column: Resource Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Resources</Label>
                  <p className="text-xs text-muted-foreground mb-4">Choose which handbooks to include in this bundle.</p>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {resources.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No active resources found.</p>
                    ) : (
                      resources.map(resource => (
                        <div key={resource.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-primary/5 transition-colors">
                          <Checkbox 
                            id={resource.id} 
                            checked={selectedResources.includes(resource.id)}
                            onCheckedChange={() => toggleResource(resource.id)}
                          />
                          <div className="space-y-1 leading-none flex-1 cursor-pointer" onClick={() => toggleResource(resource.id)}>
                            <Label className="cursor-pointer font-medium">{resource.title}</Label>
                            <p className="text-xs text-muted-foreground">₹{resource.price}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button type="submit" disabled={isPublishing || isUploading} size="lg" className="w-full sm:w-auto">
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPublishing ? 'Creating Bundle...' : 'Publish Bundle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

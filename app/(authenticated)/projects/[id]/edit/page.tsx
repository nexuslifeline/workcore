'use client'

import { useParams } from 'next/navigation'
import { ProjectEditor } from '@/features/projects/components/project-editor'

export default function ProjectEditPage() {
  const params = useParams()
  const projectId = params.id as string
  return <ProjectEditor projectId={projectId} />
}

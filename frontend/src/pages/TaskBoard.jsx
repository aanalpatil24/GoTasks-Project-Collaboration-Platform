import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import KanbanBoard from '../components/KanbanBoard'
import { useProjectStore } from '../store/projectStore'

export default function TaskBoard() {
  const { projectId } = useParams()
  const { currentProject, fetchProjectDetail } = useProjectStore()
  
  // Casts IDs to strings to prevent strict-equality infinite fetch loops against the DRF integer
  useEffect(() => {
    if (!currentProject || String(currentProject.id) !== String(projectId)) {
      fetchProjectDetail(projectId)
    }
  }, [projectId, fetchProjectDetail, currentProject])

  return (
    // Height calculation accounts for the fixed Layout header and padding
    <div className="h-[calc(100vh-140px)] overflow-hidden">
      <KanbanBoard 
        projectId={projectId} 
        userRole={currentProject?.user_role} 
      />
    </div>
  )
}
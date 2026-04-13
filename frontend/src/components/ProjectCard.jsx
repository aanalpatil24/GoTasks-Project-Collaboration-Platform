import { Link } from 'react-router-dom'
import { Users, ArrowRight, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectCard({ project }) {
  return (
    <Link 
      to={`/projects/${project.id}`}
      // Implements surface background and primary-green hover borders for the dark IDE aesthetic
      className="block bg-surface rounded-xl border border-border hover:border-primary-green/50 transition-all p-6 group shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Transitions title color to primary-green on hover for interactive feedback */}
          <h3 className="text-lg font-semibold text-text-light group-hover:text-primary-green transition-colors">
            {project.name}
          </h3>
          {/* Constrains description length to maintain grid alignment across cards */}
          <p className="text-sm text-text-muted mt-1 line-clamp-2">
            {project.description || 'No description provided.'}
          </p>
        </div>
        <div className="ml-4">
          {/* Dynamically styles role badges using theme-consistent accent and primary colors */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
            project.user_role === 'OWNER' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' : 
            project.user_role === 'ADMIN' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 
            'bg-background text-text-muted border-border'
          }`}>
            {project.user_role}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          {/* Displays current member count with Lucide icon integration */}
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4" />
            <span>{project.members_count} members</span>
          </div>
          {/* Formats relative time since creation with a safety check for null timestamps */}
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4" />
            <span>{project.created_at ? formatDistanceToNow(new Date(project.created_at)) : 'recent'} ago</span>
          </div>
        </div>
        {/* Animated arrow provides a subtle visual cue for user navigability */}
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-green group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}
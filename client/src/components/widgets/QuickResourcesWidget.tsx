/**
 * QuickResourcesWidget
 *
 * Affiche les ressources rapides (PDFs, vidéos, etc.)
 * pour un accès direct depuis le dashboard
 */

import { useState, useEffect } from 'react';
import { Book, Video, FileText, Download, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  title: string;
  description: string;
  url: string;
  programId?: number;
  order: number;
}

interface QuickResourcesWidgetProps {
  className?: string;
  limit?: number; // Limit number of resources shown
}

export default function QuickResourcesWidget({ className = '', limit = 4 }: QuickResourcesWidgetProps) {
  const [resources, setResources] = useState<Resource[]>([]);

  // TODO: Récupérer les vraies ressources via tRPC
  useEffect(() => {
    // Mock data
    const mockResources: Resource[] = [
      {
        id: '1',
        type: 'pdf',
        title: 'Guide Nutrition Transform',
        description: 'Guide complet pour votre transformation physique',
        url: '/resources/nutrition-guide.pdf',
        programId: 1,
        order: 1,
      },
      {
        id: '2',
        type: 'video',
        title: 'Technique de Squat Parfait',
        description: 'Vidéo tutorielle: maître le squat',
        url: '/resources/squat-tutorial.mp4',
        programId: 1,
        order: 2,
      },
      {
        id: '3',
        type: 'document',
        title: 'Planning Semaine 1-4',
        description: 'Votre programme d\'entraînement initial',
        url: '/resources/week1-4-plan.pdf',
        programId: 1,
        order: 3,
      },
      {
        id: '4',
        type: 'link',
        title: 'Calculateur Macros',
        description: 'Calculez vos besoins en macronutriments',
        url: 'https://calculator.example.com',
        programId: 1,
        order: 4,
      },
      {
        id: '5',
        type: 'pdf',
        title: 'Recettes Fit & Saines',
        description: '50 recettes pour vos objectifs',
        url: '/resources/recipes.pdf',
        programId: 1,
        order: 5,
      },
    ];

    setResources(mockResources.slice(0, limit));
  }, [limit]);

  const typeIcons: Record<string, any> = {
    pdf: FileText,
    video: Video,
    link: ExternalLink,
    document: Book,
  };

  const typeColors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600',
    video: 'bg-purple-100 text-purple-600',
    link: 'bg-blue-100 text-blue-600',
    document: 'bg-green-100 text-green-600',
  };

  const typeLabels: Record<string, string> = {
    pdf: 'PDF',
    video: 'Vidéo',
    link: 'Lien externe',
    document: 'Document',
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-black text-lg">Ressources Rapides</h3>
        <a
          href="/dashboard/resources"
          className="text-gold hover:text-black text-sm font-semibold"
        >
          Tout voir →
        </a>
      </div>

      {/* Resources Grid */}
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const Icon = typeIcons[resource.type] || FileText;

            return (
              <a
                key={resource.id}
                href={resource.url}
                target={resource.type === 'link' ? '_blank' : undefined}
                rel={resource.type === 'link' ? 'noopener noreferrer' : undefined}
                className="group p-4 bg-gray-50 hover:bg-gold/10 border-2 border-gray-200 hover:border-gold rounded-lg transition-all"
              >
                {/* Resource Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[resource.type]}`}>
                    {typeLabels[resource.type]}
                  </span>
                  {resource.type !== 'link' && (
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors" />
                  )}
                </div>

                {/* Resource Content */}
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[resource.type]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black text-sm line-clamp-1 group-hover:text-gold transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                  </div>
                </div>

                {/* External Link Indicator */}
                {resource.type === 'link' && (
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-2" />
                )}
              </a>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8">
          <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune ressource disponible</p>
          <a
            href="/dashboard/resources"
            className="inline-block bg-gold hover:bg-gold/90 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Découvrir les ressources
          </a>
        </div>
      )}

      {/* View All Link (if more resources exist) */}
      {resources.length >= limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <a
            href="/dashboard/resources"
            className="text-gold hover:text-black font-semibold"
          >
            Voir toutes les ressources →
          </a>
        </div>
      )}
    </div>
  );
}

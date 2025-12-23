"use client";

import React, { useState, useEffect } from 'react';
import { EmberCard } from '@/ui/cinematic-ember';

interface Release {
  version: string;
  date: string;
  notes: string;
}

export const ChangelogView: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchChangelog();
  }, []);

  const fetchChangelog = async () => {
    try {
      // Use Electron API if available, otherwise fall back to direct fetch
      if (window.electronAPI?.getReleases) {
        const result = await window.electronAPI.getReleases();
        
        if (!result.success || !result.releases) {
          throw new Error(result.error || 'Failed to fetch releases');
        }
        
        const formattedReleases = result.releases.map((release: any) => ({
          version: release.tag_name,
          date: new Date(release.published_at).toLocaleDateString(),
          notes: release.body || 'No release notes provided.'
        }));
        
        setReleases(formattedReleases);
      } else {
        // Fallback for web/dev mode
        const response = await fetch('https://api.github.com/repos/Renkai7/mental-clarity/releases');
        if (!response.ok) throw new Error('Failed to fetch releases');
        
        const data = await response.json();
        const formattedReleases = data.map((release: any) => ({
          version: release.tag_name,
          date: new Date(release.published_at).toLocaleDateString(),
          notes: release.body || 'No release notes provided.'
        }));
        
        setReleases(formattedReleases);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Unable to load changelog. Please check your internet connection.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <EmberCard variant="amber" className="p-6">
          <p className="text-sm text-text-muted">Loading changelog...</p>
        </EmberCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <EmberCard variant="amber" className="p-6">
          <p className="text-sm text-red-400">{error}</p>
        </EmberCard>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">What&apos;s New</h1>
        <p className="text-sm text-text-muted">
          Recent updates and improvements to Mental Clarity
        </p>
      </div>

      <div className="space-y-4">
        {releases.map((release) => (
          <EmberCard key={release.version} variant="amber" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Version {release.version}
                </h2>
                <span className="text-xs text-text-muted">{release.date}</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <div 
                  className="text-sm text-text-muted whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatReleaseNotes(release.notes) }}
                />
              </div>
            </div>
          </EmberCard>
        ))}
      </div>

      {releases.length === 0 && (
        <EmberCard variant="amber" className="p-6">
          <p className="text-sm text-text-muted">No releases found.</p>
        </EmberCard>
      )}
    </div>
  );
};

function formatReleaseNotes(notes: string): string {
  // Convert markdown-style links to HTML
  let formatted = notes.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-ember-primary hover:underline">$1</a>'
  );
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert bullet points
  formatted = formatted.replace(/^[*-] /gm, '• ');
  
  return formatted;
}

export default ChangelogView;

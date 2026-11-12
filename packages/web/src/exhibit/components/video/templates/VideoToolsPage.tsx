'use client';

import { type FC, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import {
  CATEGORIES,
  TOOLS,
  type VideoToolConfig,
} from '@/exhibit/data/video/video-tools';
import { VideoConvertTool } from '@/exhibit/components/video/molecules/VideoConvertTool';
import { VideoTrimTool } from '@/exhibit/components/video/molecules/VideoTrimTool';
import { VideoMergeTool } from '@/exhibit/components/video/molecules/VideoMergeTool';
import { VideoCropTool } from '@/exhibit/components/video/molecules/VideoCropTool';
import { VideoSpeedTool } from '@/exhibit/components/video/molecules/VideoSpeedTool';
import { VideoCompressTool } from '@/exhibit/components/video/molecules/VideoCompressTool';
import { VideoMuteTool } from '@/exhibit/components/video/molecules/VideoMuteTool';
import { VideoResizeTool } from '@/exhibit/components/video/molecules/VideoResizeTool';
import { VideoStabilizeTool } from '@/exhibit/components/video/molecules/VideoStabilizeTool';
import { VideoExtractAudioTool } from '@/exhibit/components/video/molecules/VideoExtractAudioTool';
import { VideoExtractFramesTool } from '@/exhibit/components/video/molecules/VideoExtractFramesTool';
import { AudioTranscribeTool } from '@/exhibit/components/video/molecules/AudioTranscribeTool';
import { GenerateSubtitleTool } from '@/exhibit/components/video/molecules/GenerateSubtitleTool';
import { VideoDownloadTool } from '@/exhibit/components/video/molecules/VideoDownloadTool';

const TOOL_COMPONENTS: Record<string, FC<{ config: VideoToolConfig }>> = {
  'video-compress': VideoCompressTool,
  'video-crop': VideoCropTool,
  'video-extract-audio': VideoExtractAudioTool,
  'video-extract-frames': VideoExtractFramesTool,
  'video-merge': VideoMergeTool,
  'video-mute': VideoMuteTool,
  'video-resize': VideoResizeTool,
  'video-speed': VideoSpeedTool,
  'video-stabilize': VideoStabilizeTool,
  'video-trim': VideoTrimTool,
  'audio-transcribe': AudioTranscribeTool,
  'generate-subtitle': GenerateSubtitleTool,
};

const getToolComponent = (id: string): FC<{ config: VideoToolConfig }> => {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) return VideoConvertTool;
  if (TOOL_COMPONENTS[id]) return TOOL_COMPONENTS[id];
  if (tool.category === 'convert') return VideoConvertTool;
  if (tool.category === 'download') return VideoDownloadTool;
  return VideoConvertTool;
};

const CATEGORY_TOOLS: Record<string, string[]> = {};
for (const t of TOOLS) {
  (CATEGORY_TOOLS[t.category] ??= []).push(t.id);
}

const toolCategoryMap: Record<string, string> = {};
for (const [cat, ids] of Object.entries(CATEGORY_TOOLS)) {
  for (const id of ids) {
    toolCategoryMap[id] = cat;
  }
}

export const VideoToolsPage: FC = () => {
  const [activeTool, setActiveTool] = useState<VideoToolConfig | null>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, false]))
  );

  const filteredByQuery = useMemo(
    () =>
      !query.trim()
        ? TOOLS
        : TOOLS.filter(
            (t) =>
              t.title.toLowerCase().includes(query.toLowerCase()) ||
              t.description.toLowerCase().includes(query.toLowerCase())
          ),
    [query]
  );

  const grouped = useMemo(() => {
    const map: Record<string, VideoToolConfig[]> = {};
    for (const t of filteredByQuery) {
      const cat = toolCategoryMap[t.id] ?? 'misc';
      (map[cat] ??= []).push(t);
    }
    return map;
  }, [filteredByQuery]);

  const ToolComponent = activeTool ? getToolComponent(activeTool.id) : null;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-base-300 flex items-center gap-4 border-b px-4 py-3">
        <Link
          href="/design-system/exhibits"
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Back to home">
          <FiArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base-content text-lg font-bold">
          {activeTool ? activeTool.title : 'Video Tools'}
        </h1>
      </header>
      <div className="flex flex-1 flex-row-reverse overflow-hidden">
        <aside className="border-base-300 flex w-56 shrink-0 flex-col border-l bg-inherit">
          <div className="border-base-300 border-b p-3">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {CATEGORIES.map((cat) => {
              const tools = grouped[cat.key];
              if (!tools || tools.length === 0) return null;
              const isExpanded = query.trim().length > 0 || expanded[cat.key];
              return (
                <div key={cat.key}>
                  <button
                    className="hover:bg-base-200 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [cat.key]: !prev[cat.key],
                      }))
                    }>
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="flex-1">{cat.label}</span>
                    <span className="text-base-content/30 text-xs">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-2 space-y-0.5">
                      {tools.map((tool) => (
                        <button
                          key={tool.id}
                          className={`hover:bg-base-200 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                            activeTool?.id === tool.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : ''
                          }`}
                          onClick={() => setActiveTool(tool)}>
                          <span>{tool.emoji}</span>
                          <span>{tool.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>
        <div className="flex flex-1 flex-col overflow-y-auto p-8">
          {activeTool && ToolComponent ? (
            <ToolComponent config={activeTool} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-base-content/30 text-sm">
                Select a video tool from the sidebar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

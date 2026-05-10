import React, { useEffect, useState } from 'react';
import { Brain, Network, Flame, Hammer, Code2, FolderTree, Loader2, RefreshCw, Rocket, CheckCircle2 } from 'lucide-react';
import { learningApi, SmartCompression, BuildModePlan, LearningProject } from '../lib/api';

interface SmartLearningLabProps {
  courseId: string;
  courseTopics?: string[];
}

const SmartLearningLab: React.FC<SmartLearningLabProps> = ({ courseId, courseTopics = [] }) => {
  const [compression, setCompression] = useState<SmartCompression | null>(null);
  const [buildMode, setBuildMode] = useState<BuildModePlan | null>(null);
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isLoadingCompression, setIsLoadingCompression] = useState(false);
  const [isLoadingBuildMode, setIsLoadingBuildMode] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [updatingTaskKey, setUpdatingTaskKey] = useState<string | null>(null);
  const [audience, setAudience] = useState<'five' | 'fifteen' | 'expert'>('fifteen');

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await learningApi.getProjectBuilders(courseId);
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error loading project builders:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [courseId]);

  useEffect(() => {
    if (courseTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(courseTopics[0]);
    }
  }, [courseTopics, selectedTopic]);

  const loadCompression = async () => {
    setIsLoadingCompression(true);
    try {
      const response = await learningApi.generateSmartCompression({ courseId });
      setCompression(response.compression);
    } catch (error) {
      console.error('Error loading smart compression:', error);
      alert('Failed to generate smart content compression.');
    } finally {
      setIsLoadingCompression(false);
    }
  };

  const loadBuildMode = async () => {
    setIsLoadingBuildMode(true);
    try {
      const response = await learningApi.generateBuildMode({ courseId });
      setBuildMode(response.buildMode);
    } catch (error) {
      console.error('Error loading build mode:', error);
      alert('Failed to generate build-while-learning plan.');
    } finally {
      setIsLoadingBuildMode(false);
    }
  };

  const audienceLabelMap: Record<'five' | 'fifteen' | 'expert', string> = {
    five: 'Explain like 5',
    fifteen: 'Explain like 15',
    expert: 'Explain like Expert'
  };

  const handleGenerateProject = async () => {
    const topic = selectedTopic.trim();
    if (!topic) {
      alert('Please select or enter a topic first.');
      return;
    }

    setIsGeneratingProject(true);
    try {
      const response = await learningApi.generateProjectBuilder({
        courseId,
        topic
      });
      setProjects((prev) => [response.project, ...prev]);
    } catch (error) {
      console.error('Error generating project builder:', error);
      alert('Failed to generate project. Please try again.');
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleToggleTask = async (projectId: string, taskId: string, completed: boolean) => {
    const key = `${projectId}:${taskId}`;
    setUpdatingTaskKey(key);
    try {
      const response = await learningApi.updateProjectBuilderTask(projectId, taskId, completed);
      setProjects((prev) => prev.map((project) => project.projectId === projectId ? response.project : project));
    } catch (error) {
      console.error('Error updating project task:', error);
      alert('Failed to update task progress.');
    } finally {
      setUpdatingTaskKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Content Compression</h3>
            <p className="text-sm text-gray-600">Multi-level explanation, concept dependency graph, and exam-focused hotspots.</p>
          </div>
          <button
            onClick={loadCompression}
            disabled={isLoadingCompression}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingCompression ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Generate Compression
              </>
            )}
          </button>
        </div>

        {compression && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-cyan-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                <Brain className="h-4 w-4" />
                Explain like 5 / 15 / expert
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {(['five', 'fifteen', 'expert'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAudience(type)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      audience === type ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-700'
                    }`}
                  >
                    {audienceLabelMap[type]}
                  </button>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{compression.explainLike[audience]}</p>
            </div>

            <div className="rounded-xl border border-sky-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-700">
                <Network className="h-4 w-4" />
                Concept dependency graph
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {compression.dependencyGraph.nodes.map((node) => (
                  <span
                    key={node.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      node.group === 'foundation'
                        ? 'bg-emerald-100 text-emerald-700'
                        : node.group === 'core'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {node.label}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {compression.dependencyGraph.edges.map((edge, index) => {
                  const fromLabel = compression.dependencyGraph.nodes.find((n) => n.id === edge.from)?.label || edge.from;
                  const toLabel = compression.dependencyGraph.nodes.find((n) => n.id === edge.to)?.label || edge.to;
                  return (
                    <div key={`${edge.from}-${edge.to}-${index}`} className="rounded-lg bg-sky-50 p-2 text-xs text-sky-900">
                      <strong>{fromLabel}</strong> {'->'} <strong>{toLabel}</strong> : {edge.reason}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <Flame className="h-4 w-4" />
                High-frequency exam topics
              </div>
              <div className="space-y-2">
                {compression.examHotTopics.map((topic, index) => (
                  <div key={`${topic.topic}-${index}`} className="rounded-lg bg-amber-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{topic.topic}</p>
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        {topic.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{topic.whyImportant}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Build While Learning</h3>
            <p className="text-sm text-gray-600">Get mini tasks, code challenges, and a project skeleton aligned to what you learn.</p>
          </div>
          <button
            onClick={loadBuildMode}
            disabled={isLoadingBuildMode}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingBuildMode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building plan...
              </>
            ) : (
              <>
                <Hammer className="h-4 w-4" />
                Generate Build Plan
              </>
            )}
          </button>
        </div>

        {buildMode && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-indigo-200 bg-white p-4">
              <h4 className="mb-3 text-sm font-semibold text-indigo-700">Mini Tasks</h4>
              <div className="space-y-2">
                {buildMode.miniTasks.map((task, index) => (
                  <div key={`${task.title}-${index}`} className="rounded-lg bg-indigo-50 p-2">
                    <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.objective}</p>
                    <p className="mt-1 text-[11px] text-indigo-700">{task.estimatedMinutes} min • {task.linkedTopic}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-violet-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700">
                <Code2 className="h-4 w-4" />
                Code Challenges
              </div>
              <div className="space-y-2">
                {buildMode.codeChallenges.map((challenge, index) => (
                  <div key={`${challenge.title}-${index}`} className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-semibold text-gray-800">{challenge.title}</p>
                    <p className="text-xs text-gray-600">{challenge.prompt}</p>
                    <p className="mt-1 text-[11px] text-violet-700">{challenge.difficulty} • Hint: {challenge.starterHint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-fuchsia-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fuchsia-700">
                <FolderTree className="h-4 w-4" />
                Project Skeleton
              </div>
              <p className="text-sm font-semibold text-gray-800">{buildMode.projectSkeleton.projectName}</p>
              <p className="mb-2 text-xs text-gray-600">{buildMode.projectSkeleton.description}</p>

              <div className="mb-3 space-y-1">
                {buildMode.projectSkeleton.folders.map((folder, index) => (
                  <div key={`${folder.path}-${index}`} className="rounded bg-fuchsia-50 p-2 text-xs">
                    <p className="font-semibold text-gray-800">{folder.path}</p>
                    <p className="text-gray-600">{folder.purpose}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {buildMode.projectSkeleton.milestones.map((milestone, index) => (
                  <div key={`${milestone}-${index}`} className="text-xs text-fuchsia-800">
                    {index + 1}. {milestone}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Auto Project Builder from Learning</h3>
            <p className="text-sm text-gray-600">Choose a learned topic and get a mini-project idea, folder structure, starter code, and milestone tasks.</p>
          </div>
          <button
            onClick={loadProjects}
            disabled={isLoadingProjects}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingProjects ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Projects
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-emerald-700">Topic</label>
              {courseTopics.length > 0 ? (
                <select
                  aria-label="Select topic for auto project builder"
                  title="Select topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm text-gray-800"
                >
                  {courseTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="e.g. React hooks"
                  className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm text-gray-800"
                />
              )}
            </div>
            <button
              onClick={handleGenerateProject}
              disabled={isGeneratingProject}
              className="inline-flex h-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingProject ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Generate Project
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {projects.length === 0 ? (
            <p className="text-sm text-gray-600">No projects generated yet. Start by selecting a topic and creating your first project.</p>
          ) : (
            projects.map((project) => (
              <div key={project.projectId} className="rounded-xl border border-emerald-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{project.projectIdea}</h4>
                    <p className="text-xs text-gray-600">Topic: {project.topic} • Status: {project.status}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                    {project.completionPercent}% complete
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <FolderTree className="h-4 w-4" /> Folder Structure
                    </div>
                    <div className="space-y-1">
                      {project.folderStructure.slice(0, 6).map((folder, index) => (
                        <div key={`${folder.path}-${index}`} className="text-xs text-gray-700">
                          <span className="font-semibold">{folder.path}</span> - {folder.purpose}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <Code2 className="h-4 w-4" /> Starter Code Files
                    </div>
                    <div className="space-y-1">
                      {project.starterCode.slice(0, 4).map((file, index) => (
                        <div key={`${file.path}-${index}`} className="text-xs text-gray-700">
                          <span className="font-semibold">{file.path}</span> ({file.language})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-100 bg-white p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Tasks to Complete</div>
                  <div className="space-y-2">
                    {project.tasks.map((task) => {
                      const taskKey = `${project.projectId}:${task.taskId}`;
                      return (
                        <label key={task.taskId} className="flex items-start gap-2 rounded bg-gray-50 p-2 text-sm">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            disabled={updatingTaskKey === taskKey}
                            onChange={(e) => handleToggleTask(project.projectId, task.taskId, e.target.checked)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className={`font-semibold ${task.completed ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>{task.title}</p>
                            <p className="text-xs text-gray-600">{task.description}</p>
                          </div>
                          {task.completed && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {project.milestones && project.milestones.length > 0 && (
                  <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Milestones</div>
                    <div className="space-y-1">
                      {project.milestones.map((milestone, index) => (
                        <div key={`${milestone}-${index}`} className="text-xs text-gray-700">{index + 1}. {milestone}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartLearningLab;

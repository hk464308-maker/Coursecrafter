/**
 * ============================================================================
 * COURSECRAFTER: PRODUCTION RELEASE CANDIDATE (Unified Single-File Architecture)
 * ============================================================================
 * Assembles Home, TeachingWorkspace, StudentPreview, WeekCard, EditWeekDialog,
 * and SyncOverlay into a seamless, production-grade academic workspace.
 * ============================================================================
 */

import React, { createContext, useContext, useReducer, useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. TYPESCRIPT INTERFACES
// ============================================================================

export type ArtifactType = 'assignment' | 'lecture' | 'reading' | 'rubric' | 'quiz';

export interface CourseArtifact {
  id: string;
  moduleId: string;
  title: string;
  type: ArtifactType;
  dueDate: string;
  status: 'synced' | 'pending_review' | 'manual_override';
  content?: string;
  aiChangeNote?: string;
}

export interface CourseModule {
  id: string;
  weekNumber: number;
  title: string;
  topic: string;
  dateRange: string;
  objectives: string[];
  readings: string[];
  assignments: string[];
  quizDate: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  term: string;
  instructor: string;
  modules: CourseModule[];
  artifacts: CourseArtifact[];
}

export interface GeminiSuggestion {
  id: string;
  triggerModuleId: string;
  affectedArtifactId: string;
  description: string;
  proposedChange: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  triggerDescription: string;
  impactCount: number;
}

export type WorkspaceMode = 'home' | 'teacher' | 'studentPreview';

export interface WorkspaceState {
  currentCourse: Course;
  selectedModuleId: string;
  currentMode: WorkspaceMode;
  syncEvents: SyncEvent[];
  suggestions: GeminiSuggestion[];
}

// ============================================================================
// 2. REALISTIC UNIVERSITY MOCK DATA
// ============================================================================

export const INITIAL_COURSE: Course = {
  id: 'course-bio301',
  title: 'Molecular Genetics & Cellular Pathways',
  code: 'BIOS-301',
  term: 'Fall 2026',
  instructor: 'Dr. Elena Rostova',
  modules: [
    {
      id: 'mod-1',
      weekNumber: 1,
      title: 'DNA Replication Fidelity & Mutagenesis',
      topic: 'Polymerase proofreading, mismatch repair, and spontaneous lesions',
      dateRange: 'Sep 01 - Sep 07',
      objectives: [
        'Analyze enzymatic mechanisms of DNA proofreading',
        'Calculate mutation frequencies resulting from replication errors'
      ],
      readings: [
        'Molecular Biology of the Cell (Chapter 5: DNA Replication)',
        'Fidelity of Replication and Repair Mechanisms'
      ],
      assignments: ['Problem Set 1: Replication Kinetics & Proofreading'],
      quizDate: 'Sep 08'
    },
    {
      id: 'mod-2',
      weekNumber: 2,
      title: 'Transcriptional Regulation & Operons',
      topic: 'Lac operon mechanics, transcription factors, and enhancer loops',
      dateRange: 'Sep 08 - Sep 14',
      objectives: [
        'Model the kinetics of negative and positive gene regulation',
        'Examine eukaryotic chromatin remodeling complexes'
      ],
      readings: [
        'Gene Expression and Regulation (Chapters 7-9)',
        'The Logic of Bacterial Operons (Jacob & Monod)'
      ],
      assignments: ['Lab Report 1: Lac Operon Induction Assay'],
      quizDate: 'Sep 15'
    },
    {
      id: 'mod-3',
      weekNumber: 3,
      title: 'RNA Processing & Splicing Machinery',
      topic: 'Spliceosomes, alternative splicing, and non-coding RNAs',
      dateRange: 'Sep 15 - Sep 21',
      objectives: [
        'Trace the spliceosome catalytic cycle (snRNPs)',
        'Analyze tissue-specific alternative splicing patterns'
      ],
      readings: [
        'RNA Splicing and Disease (Nature Reviews)',
        'Alternative Splicing in Eukaryotic Gene Expression'
      ],
      assignments: ['Problem Set 2: Splicing Site Mutation Analysis'],
      quizDate: 'Sep 22'
    },
    {
      id: 'mod-4',
      weekNumber: 4,
      title: 'Translation and Ribosomal Kinetics',
      topic: 'Initiation factors, codon-anticodon pairing, and tRNA charging',
      dateRange: 'Sep 22 - Sep 28',
      objectives: [
        'Examine translation initiation mechanisms in eukaryotes',
        'Evaluate ribosomal pausing and translational control'
      ],
      readings: [
        'Protein Biosynthesis and Ribosomal Structure',
        'Translational Control in Stress Responses'
      ],
      assignments: ['Lab Report 2: Polysome Profiling Analysis'],
      quizDate: 'Sep 29'
    },
    {
      id: 'mod-5',
      weekNumber: 5,
      title: 'Epigenetic Inheritance & Histone Codes',
      topic: 'DNA methylation, histone acetylation, and chromatin compaction',
      dateRange: 'Sep 29 - Oct 05',
      objectives: [
        'Map epigenetic modifications to transcriptional output',
        'Investigate genomic imprinting disorders'
      ],
      readings: [
        'Epigenetics (Allis et al., Chapters 3 & 6)',
        'Histone Modifications and Chromatin Dynamics'
      ],
      assignments: ['Term Paper Outline: Epigenetic Dysregulation in Cancer'],
      quizDate: 'Oct 06'
    },
    {
      id: 'mod-6',
      weekNumber: 6,
      title: 'CRISPR-Cas Gene Editing & Therapeutics',
      topic: 'Guide RNA design, Cas9 endonuclease cleavage, and off-target effects',
      dateRange: 'Oct 06 - Oct 12',
      objectives: [
        'Design synthetic sgRNAs for targeted gene knockouts',
        'Evaluate homology-directed repair vs non-homologous end joining'
      ],
      readings: [
        'CRISPR-Cas9 Mechanism and Applications (Doudna & Charpentier)',
        'Precision Genome Editing in Human Cells'
      ],
      assignments: ['Final Capstone: Gene Knockout Experimental Design'],
      quizDate: 'Oct 13'
    }
  ],
  artifacts: [
    {
      id: 'art-1',
      moduleId: 'mod-1',
      title: 'Problem Set 1: Replication Kinetics',
      type: 'assignment',
      dueDate: 'Sep 07, 2026',
      status: 'synced',
      content: 'Calculate mutation accumulation rates...'
    },
    {
      id: 'art-2',
      moduleId: 'mod-2',
      title: 'Lab Report 1: Lac Operon',
      type: 'assignment',
      dueDate: 'Sep 14, 2026',
      status: 'synced',
      content: 'Measure beta-galactosidase activity...'
    }
  ]
};

// ============================================================================
// 3. STATE REDUCER & CONTEXT
// ============================================================================

export type WorkspaceAction =
  | { type: 'SET_ACTIVE_MODULE'; payload: string }
  | { type: 'UPDATE_MODULE'; payload: CourseModule }
  | { type: 'ADD_SYNC_EVENT'; payload: SyncEvent }
  | { type: 'TOGGLE_PREVIEW_MODE'; payload: WorkspaceMode }
  | { type: 'APPLY_AI_SUGGESTION'; payload: string };

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_ACTIVE_MODULE':
      return { ...state, selectedModuleId: action.payload };
    case 'UPDATE_MODULE':
      return {
        ...state,
        currentCourse: {
          ...state.currentCourse,
          modules: state.currentCourse.modules.map((m) =>
            m.id === action.payload.id ? action.payload : m
          )
        }
      };
    case 'ADD_SYNC_EVENT':
      return { ...state, syncEvents: [action.payload, ...state.syncEvents] };
    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, currentMode: action.payload };
    case 'APPLY_AI_SUGGESTION':
      return {
        ...state,
        suggestions: state.suggestions.map((s) =>
          s.id === action.payload ? { ...s, status: 'accepted' as const } : s
        )
      };
    default:
      return state;
  }
}

interface WorkspaceContextType {
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, {
    currentCourse: INITIAL_COURSE,
    selectedModuleId: INITIAL_COURSE.modules[0].id,
    currentMode: 'home',
    syncEvents: [],
    suggestions: []
  });

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// ============================================================================
// 4. REUSABLE COMPONENTS
// ============================================================================

function LogoHeader() {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md shadow-indigo-500/25">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <span className="text-xl font-semibold tracking-tight text-zinc-900 font-sans">
        Course<span className="text-indigo-600">Crafter</span>
      </span>
    </div>
  );
}

function WeekCard({
  module,
  onSelect,
  syncStatus = 'synced'
}: {
  module: CourseModule;
  onSelect: (moduleId: string) => void;
  syncStatus?: 'synced' | 'pending_review' | 'manual_override';
}) {
  const badgeConfig = {
    synced: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      dot: 'bg-emerald-500',
      label: 'Synchronized'
    },
    pending_review: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      dot: 'bg-amber-500 animate-pulse',
      label: 'Sync Pending'
    },
    manual_override: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      dot: 'bg-indigo-500',
      label: 'Manual Override'
    }
  }[syncStatus];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onSelect(module.id)}
      className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm hover:shadow-lg hover:border-indigo-300/60 transition-all cursor-pointer flex flex-col justify-between gap-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-xs font-mono font-semibold tracking-wider uppercase shadow-sm">
            Week 0{module.weekNumber}
          </span>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-xl">
            {module.dateRange}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${badgeConfig.bg}`}>
            <span className={`w-2 h-2 rounded-full ${badgeConfig.dot}`}></span>
            {badgeConfig.label}
          </span>

          <div className="w-8 h-8 rounded-full bg-zinc-50 group-hover:bg-indigo-50 text-zinc-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight group-hover:text-indigo-600 transition-colors">
          {module.title}
        </h3>
        <p className="text-sm text-zinc-500 font-normal leading-relaxed">
          {module.topic}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-100 text-xs">
        <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
          <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Assignments</p>
          <p className="text-zinc-800 font-medium truncate">{module.assignments[0] || 'None'}</p>
        </div>
        <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
          <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Readings</p>
          <p className="text-zinc-800 font-medium truncate">{module.readings[0] || 'None'}</p>
        </div>
        <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
          <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Quiz Milestone</p>
          <p className="text-zinc-800 font-medium">{module.quizDate}</p>
        </div>
      </div>
    </motion.div>
  );
}

function EditWeekDialog({
  module,
  isOpen,
  onClose,
  onSave
}: {
  module: CourseModule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedModule: CourseModule) => void;
}) {
  if (!isOpen || !module) return null;

  const [title, setTitle] = useState(module.title);
  const [topic, setTopic] = useState(module.topic);
  const [dateRange, setDateRange] = useState(module.dateRange);
  const [quizDate, setQuizDate] = useState(module.quizDate);
  const [assignment, setAssignment] = useState(module.assignments[0] || '');
  const [reading, setReading] = useState(module.readings[0] || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...module,
      title,
      topic,
      dateRange,
      quizDate,
      assignments: [assignment],
      readings: [reading]
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div>
              <span className="text-xs font-mono font-semibold text-indigo-600 uppercase tracking-wider">
                Week 0{module.weekNumber} Editor
              </span>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Edit Syllabus Module</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Module Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Topic Subtitle</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date Range</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Primary Assignment</label>
                <input
                  type="text"
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Required Reading</label>
                <input
                  type="text"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Quiz Milestone Date</label>
              <input
                type="text"
                value={quizDate}
                onChange={(e) => setQuizDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-indigo-50/30 border border-indigo-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm">
                <span>✨</span>
                <span>Gemini Insight</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                Modifying schedule parameters for this week will automatically evaluate downstream impacts across:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-xs text-indigo-900 font-medium pt-1">
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>1 linked assignment</li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>1 quiz milestone</li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Student roadmap feed</li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Course timeline sync</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SyncOverlay({
  isOpen,
  onComplete,
  impactCount = 4
}: {
  isOpen: boolean;
  onComplete: () => void;
  impactCount?: number;
}) {
  const [step, setStep] = useState<'analyzing' | 'checklist' | 'success'>('analyzing');
  const [checkedItems, setCheckedItems] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setStep('analyzing');
      setCheckedItems(0);
      return;
    }

    const timer1 = setTimeout(() => {
      setStep('checklist');
    }, 600);

    const interval = setInterval(() => {
      setCheckedItems((prev) => {
        if (prev < 4) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setStep('success');
          }, 400);
          return prev;
        }
      });
    }, 350);

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const checklistItems = [
    'Assignment due dates updated',
    'Quiz schedule synchronized',
    'Student roadmap propagated',
    'Course timeline refreshed'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200/80 p-8 sm:p-10 z-10 flex flex-col items-center text-center overflow-hidden"
        >
          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 space-y-6 flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <span className="text-xl">✨</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Analyzing course changes...</h3>
                <p className="text-sm text-zinc-500 font-medium">CourseCrafter AI is computing downstream ripple effects.</p>
              </div>
            </motion.div>
          )}

          {step === 'checklist' && (
            <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="py-6 w-full space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-indigo-600 uppercase tracking-widest">Propagation Engine</span>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Synchronizing Course Artifacts</h3>
              </div>
              <div className="space-y-3 text-left bg-zinc-50/80 p-5 rounded-2xl border border-zinc-100">
                {checklistItems.map((item, index) => {
                  const isChecked = index < checkedItems;
                  return (
                    <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: index < checkedItems ? 1 : 0.3, x: 0 }} transition={{ duration: 0.2 }} className="flex items-center space-x-3 text-sm font-medium">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-zinc-200 text-zinc-400'}`}>
                        {isChecked ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                        )}
                      </div>
                      <span className={isChecked ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}>{item}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="py-6 w-full space-y-6 flex flex-col items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Everything is synchronized.</h3>
                <p className="text-sm text-zinc-500 font-normal max-w-xs mx-auto leading-relaxed">
                  {impactCount} academic resources were updated automatically across the student feed.
                </p>
              </div>
              <div className="pt-4 w-full">
                <button
                  onClick={onComplete}
                  className="w-full py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.99]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================================================
// 5. SCREEN VIEWS
// ============================================================================

function HomeScreen() {
  const { state, dispatch } = useWorkspace();
  const course = state.currentCourse;

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <LogoHeader />
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
        <div className="max-w-3xl space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]"
          >
            Where every course change <span className="text-indigo-600">stays in sync.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-500 font-normal leading-relaxed"
          >
            CourseCrafter is an AI-powered academic workspace for educators. Update your syllabus once, and watch downstream assignments, readings, and quizzes synchronize instantly.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium tracking-wide uppercase border border-emerald-200/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synchronization Active
              </span>
              <span className="text-xs font-semibold text-zinc-400 font-mono tracking-wider">{course.code}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{course.title}</h2>
            <p className="text-sm text-zinc-500 font-medium">
              {course.term} &bull; Instructor: {course.instructor}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-50/80 px-6 py-4 rounded-2xl border border-zinc-100 self-stretch md:self-auto justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Curriculum</p>
              <p className="text-lg font-bold text-zinc-900">{course.modules.length} Modules</p>
            </div>
            <div className="h-8 w-px bg-zinc-200"></div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Linked Artifacts</p>
              <p className="text-lg font-bold text-zinc-900">{course.artifacts.length} Active</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE', payload: 'teacher' })}
            className="group relative rounded-3xl p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white shadow-xl shadow-zinc-900/10 border border-zinc-800"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6">
                Authoring Mode
              </span>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">Teaching Workspace</h3>
              <p className="text-sm leading-relaxed text-zinc-300">Design, organize and evolve your course curriculum with real-time AI impact analysis.</p>
            </div>
            <div className="pt-12 flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide flex items-center gap-2 group-hover:translate-x-1 transition-transform text-indigo-400">
                Continue <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 group-hover:bg-white/20 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE', payload: 'studentPreview' })}
            className="group relative rounded-3xl p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 bg-white text-zinc-900 border border-zinc-200/80 shadow-sm hover:border-indigo-200 hover:shadow-md"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6">
                Live Feed
              </span>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900">Student Preview</h3>
              <p className="text-sm leading-relaxed text-zinc-500">Experience the live course feed and synchronized timeline exactly as students will see it.</p>
            </div>
            <div className="pt-12 flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide flex items-center gap-2 group-hover:translate-x-1 transition-transform text-indigo-600">
                Preview <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function TeachingWorkspace() {
  const { state, dispatch } = useWorkspace();
  const course = state.currentCourse;

  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMap, setSyncStatusMap] = useState<Record<string, 'synced' | 'pending_review'>>({
    'mod-1': 'synced', 'mod-2': 'synced', 'mod-3': 'synced',
    'mod-4': 'synced', 'mod-5': 'synced', 'mod-6': 'synced'
  });

  const handleSelectModule = (moduleId: string) => {
    const found = course.modules.find((m) => m.id === moduleId);
    if (found) {
      setSelectedModule(found);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveModule = (updatedModule: CourseModule) => {
    dispatch({ type: 'UPDATE_MODULE', payload: updatedModule });
    setSyncStatusMap((prev) => ({ ...prev, [updatedModule.id]: 'pending_review' }));
  };

  const handleSyncComplete = () => {
    setIsSyncing(false);
    const resetMap: Record<string, 'synced'> = {};
    course.modules.forEach((m) => { resetMap[m.id] = 'synced'; });
    setSyncStatusMap(resetMap);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE', payload: 'home' })}
              className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
              title="Return to Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-indigo-600 uppercase tracking-wider">{course.code}</span>
                <span className="text-xs text-zinc-400">&bull;</span>
                <span className="text-xs text-zinc-500 font-medium">Last synchronized: 2 minutes ago</span>
              </div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">{course.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSyncing(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <span>✨</span>
              <span>Synchronize Changes</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-semibold flex items-center justify-center shadow-sm">
              {course.instructor.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium tracking-wide uppercase border border-indigo-200/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Teaching Workspace &bull; Authoring Mode
              </span>
              <span className="text-xs font-semibold text-zinc-400 font-mono tracking-wider">{course.term}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Curriculum Management</h2>
            <p className="text-sm text-zinc-500 font-medium">
              Instructor: {course.instructor} &bull; Changes made here automatically propagate to student feeds.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-50/80 px-6 py-4 rounded-2xl border border-zinc-100 self-stretch md:self-auto justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total Weeks</p>
              <p className="text-lg font-bold text-zinc-900">{course.modules.length} Weeks</p>
            </div>
            <div className="h-8 w-px bg-zinc-200"></div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Assignments</p>
              <p className="text-lg font-bold text-zinc-900">{course.artifacts.length} Active</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Course Timeline</h3>
            <span className="text-xs font-medium text-zinc-400">Click any week to edit syllabus parameters</span>
          </div>

          <div className="space-y-4">
            {course.modules.map((module) => (
              <WeekCard
                key={module.id}
                module={module}
                syncStatus={syncStatusMap[module.id] || 'synced'}
                onSelect={handleSelectModule}
              />
            ))}
          </div>
        </div>
      </main>

      <EditWeekDialog
        module={selectedModule}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveModule}
      />

      <SyncOverlay
        isOpen={isSyncing}
        onComplete={handleSyncComplete}
        impactCount={course.modules.length}
      />
    </div>
  );
}

function StudentPreview() {
  const { state, dispatch } = useWorkspace();
  const course = state.currentCourse;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-[#FAFAFC] text-zinc-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE', payload: 'home' })}
              className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
              title="Return to Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-emerald-600 uppercase tracking-wider">Student Portal &bull; Read-Only</span>
                <span className="text-xs text-zinc-400">&bull;</span>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ✓ Recently synchronized
                </span>
              </div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">{course.title}</h1>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-semibold">
            Student View
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium tracking-wide uppercase border border-emerald-200/60">
                Enrolled &bull; {course.term}
              </span>
              <span className="text-xs font-semibold text-zinc-400 font-mono tracking-wider">{course.code}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Active Student Roadmap</h2>
            <p className="text-sm text-zinc-500 font-medium">
              Instructor: {course.instructor} &bull; All materials and deadlines are automatically synchronized in real-time.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-50/80 px-6 py-4 rounded-2xl border border-zinc-100 self-stretch md:self-auto justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Current Week</p>
              <p className="text-lg font-bold text-zinc-900">Week 01</p>
            </div>
            <div className="h-8 w-px bg-zinc-200"></div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Last Updated</p>
              <p className="text-lg font-bold text-zinc-900">Just Now</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Synchronized Course Timeline</h3>
            <span className="text-xs font-medium text-zinc-400">Read-only student feed</span>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, index) => {
              const isUpdatedWeek = index === 0;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className={`rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between gap-6 ${
                    isUpdatedWeek
                      ? 'bg-gradient-to-r from-emerald-50/60 via-white to-white border-emerald-200/80 shadow-sm'
                      : 'bg-white border-zinc-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-xs font-mono font-semibold tracking-wider uppercase">
                        Week 0{module.weekNumber}
                      </span>
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-xl">
                        {module.dateRange}
                      </span>
                      {isUpdatedWeek && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                    {isUpdatedWeek && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Recently Updated
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-zinc-900 tracking-tight">{module.title}</h4>
                    <p className="text-sm text-zinc-500 font-normal leading-relaxed">{module.topic}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-100 text-xs">
                    <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
                      <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Assignment</p>
                      <p className="text-zinc-800 font-medium truncate">{module.assignments[0] || 'None'}</p>
                    </div>
                    <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
                      <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Reading</p>
                      <p className="text-zinc-800 font-medium truncate">{module.readings[0] || 'None'}</p>
                    </div>
                    <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
                      <p className="text-zinc-400 font-semibold uppercase tracking-wider mb-1">Quiz Milestone</p>
                      <p className="text-zinc-800 font-medium">{module.quizDate}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base">
            <span>✨</span>
            <h3>Latest Course Changes</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            CourseCrafter automatically reconciled and synchronized all student resources following recent faculty schedule adjustments.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-zinc-700">
            <div className="flex items-center space-x-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Assignment deadline updated</span></div>
            <div className="flex items-center space-x-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Quiz rescheduled</span></div>
            <div className="flex items-center space-x-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Timeline synchronized</span></div>
            <div className="flex items-center space-x-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Learning roadmap updated</span></div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

// ============================================================================
// 6. ROOT CONTROLLER
// ============================================================================

export default function App() {
  return (
    <WorkspaceProvider>
      <MainRouter />
    </WorkspaceProvider>
  );
}

function MainRouter() {
  const { state } = useWorkspace();

  if (state.currentMode === 'teacher') {
    return <TeachingWorkspace />;
  }

  if (state.currentMode === 'studentPreview') {
    return <StudentPreview />;
  }

  return <HomeScreen />;
}


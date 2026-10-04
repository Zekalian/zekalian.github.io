import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Palette,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Printer,
  ArrowUp,
  ArrowDown,
  Camera,
  Video,
  Star,
  Image as ImageIcon,
  X,
  Upload,
  Layers,
  Sparkles,
  Clapperboard,
  SlidersHorizontal,
  ExternalLink,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, uploadFileToStorage, isWebPFile, safeSetDoc } from '../../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ImgbbGuideButton } from '../../components/admin/ImgbbGuideButton';

// Types
export type MoodboardCategory =
  | 'all'
  | 'color_palette'
  | 'lighting'
  | 'wardrobe'
  | 'location'
  | 'cinematography'
  | 'art_props';

export interface MoodboardItem {
  id: string;
  project_id: string;
  title: string;
  category: 'color_palette' | 'lighting' | 'wardrobe' | 'location' | 'cinematography' | 'art_props';
  image_url: string;
  notes: string;
  color_codes?: string[];
  aspect_ratio?: '16:9' | '9:16' | '4:3' | '1:1';
  created_by?: string;
  created_at: string;
}

export interface StoryboardScene {
  id: string;
  project_id: string;
  scene_number: string;
  shot_number: string;
  shot_order: number;
  image_url: string;
  title: string;
  shot_type: string; // e.g. Close-Up (CU), Wide Shot (WS)
  camera_movement: string; // e.g. Static, Dolly In, Pan, Handheld
  camera_lens: string; // e.g. 35mm f/1.4, 50mm Anamorphic
  lighting_notes?: string;
  action_description: string;
  dialogue_or_audio?: string;
  est_duration_sec: number;
  is_starred?: boolean;
  created_by?: string;
  created_at: string;
}

// Initial Preset Moodboard Items
const INITIAL_MOODBOARD: MoodboardItem[] = [
  {
    id: 'mb-01',
    project_id: 'general',
    title: 'Teal & Sunset Tungsten Cinematic Grading',
    category: 'color_palette',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    notes: 'Kombinasi bayangan biru kelam (teal) dan highlight tungsten hangat untuk suasana golden hour yang kontemplatif.',
    color_codes: ['#0A2540', '#1C3D5A', '#E07A5F', '#F4A261', '#F2CC8F'],
    aspect_ratio: '16:9',
    created_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'mb-02',
    project_id: 'general',
    title: 'High Contrast Chiaroscuro & Anamorphic Flare',
    category: 'lighting',
    image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80',
    notes: 'Pencahayaan dramatis satu sumber cahaya kuat (hard key light) dengan lensa anamorphic untuk flare horizontal halus.',
    color_codes: ['#050811', '#172554', '#38BDF8'],
    aspect_ratio: '16:9',
    created_at: '2026-09-21T11:00:00Z',
  },
  {
    id: 'mb-03',
    project_id: 'general',
    title: 'Modern Industrial Architectural Interior',
    category: 'location',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    notes: 'Area kantor kaca geometris dengan garis diagonal tajam untuk merefleksikan karakter korporat visioner.',
    color_codes: ['#334155', '#64748B', '#F8FAFC'],
    aspect_ratio: '16:9',
    created_at: '2026-09-22T14:30:00Z',
  },
  {
    id: 'mb-04',
    project_id: 'general',
    title: 'Utilitarian Safety Gear & Minimalist Tech Wear',
    category: 'wardrobe',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    notes: 'Seragam kru dan talent bergaya industrial kontemporer dengan aksen reflektif dan material tahan cuaca.',
    color_codes: ['#1E293B', '#F59E0B', '#10B981'],
    aspect_ratio: '4:3',
    created_at: '2026-09-23T09:15:00Z',
  },
];

// Initial Preset Storyboard Scenes
const INITIAL_STORYBOARD: StoryboardScene[] = [
  {
    id: 'sb-01',
    project_id: 'general',
    scene_number: 'Scene 01',
    shot_number: 'Shot 1A',
    shot_order: 1,
    image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    title: 'Pembuka: Atmosfer Pagi Industri Kota',
    shot_type: 'Extreme Wide Shot (EWS)',
    camera_movement: 'Slow Drone Push-In',
    camera_lens: '24mm Prime f/2.8',
    lighting_notes: 'Cahaya fajar dingin menyinari kabut tipis di atas gedung perkotaan.',
    action_description: 'Kamera meluncur maju perlahan memperlihatkan siluet fasilitas energi yang mulai beroperasi di pagi hari.',
    dialogue_or_audio: 'SFX: Suara dengungan mesin jarak jauh + Musik orkestra ambient yang membangun tensi harapan.',
    est_duration_sec: 6,
    is_starred: true,
    created_at: '2026-09-24T08:00:00Z',
  },
  {
    id: 'sb-02',
    project_id: 'general',
    scene_number: 'Scene 01',
    shot_number: 'Shot 1B',
    shot_order: 2,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    title: 'Lead Engineer Memasuki Control Room',
    shot_type: 'Medium Close-Up (MCU)',
    camera_movement: 'Tracking / Gimbal Backwards',
    camera_lens: '50mm Anamorphic f/1.8',
    lighting_notes: 'Key light neon biru monitor dengan rim light hangat di bahu talent.',
    action_description: 'Insinyur utama mengenakan helm pelindung berjalan mantap menuju panel kontrol pusat.',
    dialogue_or_audio: 'VO: "Setiap langkah besar tidak dimulai dari kemudahan, melainkan dari presisi."',
    est_duration_sec: 4,
    created_at: '2026-09-24T08:30:00Z',
  },
  {
    id: 'sb-03',
    project_id: 'general',
    scene_number: 'Scene 02',
    shot_number: 'Shot 2A',
    shot_order: 3,
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    title: 'Tatapan Percaya Diri & Kolaborasi Tim',
    shot_type: 'Close-Up (CU)',
    camera_movement: 'Static with subtle rack focus',
    camera_lens: '85mm f/1.4 Cine',
    lighting_notes: 'Softbox besar 120cm menghadap 45 derajat, bayangan kontur mata tegas.',
    action_description: 'Talent menatap monitor, mengangguk setuju kepada rekan di samping, lalu tersenyum percaya diri.',
    dialogue_or_audio: 'SFX: Suara ketukan jari di keyboard, klik mouse presisi.',
    est_duration_sec: 3,
    is_starred: true,
    created_at: '2026-09-24T09:00:00Z',
  },
];

export const AdminStoryboardPage: React.FC = () => {
  const { projects, currentUser, addToast } = useApp();

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<'moodboard' | 'storyboard'>('storyboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [moodCategoryFilter, setMoodCategoryFilter] = useState<MoodboardCategory>('all');

  // Firestore Data State
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>(INITIAL_MOODBOARD);
  const [storyboardScenes, setStoryboardScenes] = useState<StoryboardScene[]>(INITIAL_STORYBOARD);

  // Modals & Pitch Mode
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [editingMoodItem, setEditingMoodItem] = useState<MoodboardItem | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStoryScene, setEditingStoryScene] = useState<StoryboardScene | null>(null);

  // Fullscreen Pitch Mode
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [pitchIndex, setPitchIndex] = useState(0);

  // Copy Color Feedback State
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Image Uploading State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  // Sync Moodboard Items from Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'moodboard_items'),
        (snap) => {
          if (!snap.empty) {
            const loaded: MoodboardItem[] = [];
            snap.forEach((d) => {
              loaded.push({ id: d.id, ...(d.data() as Omit<MoodboardItem, 'id'>) });
            });
            loaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setMoodboardItems(loaded);
          }
        },
        (err) => console.warn('Moodboard sync note:', err.message)
      );
      return () => unsub();
    } catch (e) {
      console.warn('Moodboard listener init note:', e);
    }
  }, []);

  // Sync Storyboard Scenes from Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'storyboard_scenes'),
        (snap) => {
          if (!snap.empty) {
            const loaded: StoryboardScene[] = [];
            snap.forEach((d) => {
              loaded.push({ id: d.id, ...(d.data() as Omit<StoryboardScene, 'id'>) });
            });
            loaded.sort((a, b) => a.shot_order - b.shot_order);
            setStoryboardScenes(loaded);
          }
        },
        (err) => console.warn('Storyboard sync note:', err.message)
      );
      return () => unsub();
    } catch (e) {
      console.warn('Storyboard listener init note:', e);
    }
  }, []);

  // Filtered Lists
  const filteredMoodboard = moodboardItems.filter((item) => {
    const matchesProject = selectedProjectId === 'all' || item.project_id === selectedProjectId || item.project_id === 'general';
    const matchesCategory = moodCategoryFilter === 'all' || item.category === moodCategoryFilter;
    return matchesProject && matchesCategory;
  });

  const filteredStoryboard = storyboardScenes.filter((scene) => {
    return selectedProjectId === 'all' || scene.project_id === selectedProjectId || scene.project_id === 'general';
  });

  // Color Copy Helper
  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Keyboard Navigation for Pitch Mode
  useEffect(() => {
    if (!isPitchMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setPitchIndex((prev) => (prev < filteredStoryboard.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setPitchIndex((prev) => (prev > 0 ? prev - 1 : filteredStoryboard.length - 1));
      } else if (e.key === 'Escape') {
        setIsPitchMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPitchMode, filteredStoryboard.length]);

  // Handle Moodboard Submit
  const handleSaveMoodItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const category = formData.get('category') as MoodboardItem['category'];
    const project_id = formData.get('project_id') as string;
    const image_url = formData.get('image_url') as string;
    const notes = formData.get('notes') as string;
    const colorCodesInput = (formData.get('color_codes') as string) || '';
    const aspect_ratio = (formData.get('aspect_ratio') as MoodboardItem['aspect_ratio']) || '16:9';

    const color_codes = colorCodesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.startsWith('#') || c.length >= 3);

    const itemId = editingMoodItem ? editingMoodItem.id : `mb-${Date.now()}`;
    const newItem: MoodboardItem = {
      id: itemId,
      project_id: project_id || 'general',
      title: title.trim(),
      category,
      image_url: image_url.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      notes: notes.trim(),
      color_codes,
      aspect_ratio,
      created_by: currentUser?.full_name || 'Creative Director',
      created_at: editingMoodItem ? editingMoodItem.created_at : new Date().toISOString(),
    };

    setMoodboardItems((prev) => {
      const idx = prev.findIndex((m) => m.id === itemId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });

    setIsMoodModalOpen(false);
    setEditingMoodItem(null);

    try {
      await safeSetDoc(doc(db, 'moodboard_items', itemId), newItem, { merge: true });
      addToast('Referensi visual berhasil disimpan ke kanvas!', 'success');
    } catch (err: any) {
      addToast(`Gagal menyimpan ke Firestore: ${err.message}`, 'error');
    }
  };

  // Delete Moodboard Item
  const handleDeleteMoodItem = async (id: string) => {
    if (!confirm('Hapus referensi visual ini dari kanvas moodboard?')) return;
    setMoodboardItems((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'moodboard_items', id));
      addToast('Item moodboard dihapus.', 'info');
    } catch (err: any) {
      console.warn('Error deleting moodboard item:', err);
    }
  };

  // Handle Storyboard Scene Submit
  const handleSaveStoryScene = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const scene_number = formData.get('scene_number') as string;
    const shot_number = formData.get('shot_number') as string;
    const project_id = formData.get('project_id') as string;
    const shot_type = formData.get('shot_type') as string;
    const camera_movement = formData.get('camera_movement') as string;
    const camera_lens = formData.get('camera_lens') as string;
    const lighting_notes = (formData.get('lighting_notes') as string) || '';
    const image_url = formData.get('image_url') as string;
    const action_description = formData.get('action_description') as string;
    const dialogue_or_audio = (formData.get('dialogue_or_audio') as string) || '';
    const est_duration_sec = Number(formData.get('est_duration_sec')) || 3;

    const sceneId = editingStoryScene ? editingStoryScene.id : `sb-${Date.now()}`;
    const nextOrder = editingStoryScene ? editingStoryScene.shot_order : storyboardScenes.length + 1;

    const newScene: StoryboardScene = {
      id: sceneId,
      project_id: project_id || 'general',
      scene_number: scene_number.trim(),
      shot_number: shot_number.trim(),
      shot_order: nextOrder,
      title: title.trim(),
      shot_type,
      camera_movement,
      camera_lens: camera_lens.trim(),
      lighting_notes: lighting_notes.trim(),
      image_url: image_url.trim() || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      action_description: action_description.trim(),
      dialogue_or_audio: dialogue_or_audio.trim(),
      est_duration_sec,
      is_starred: editingStoryScene ? editingStoryScene.is_starred : false,
      created_by: currentUser?.full_name || 'Director',
      created_at: editingStoryScene ? editingStoryScene.created_at : new Date().toISOString(),
    };

    setStoryboardScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === sceneId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newScene;
        return copy.sort((a, b) => a.shot_order - b.shot_order);
      }
      return [...prev, newScene].sort((a, b) => a.shot_order - b.shot_order);
    });

    setIsStoryModalOpen(false);
    setEditingStoryScene(null);

    try {
      await safeSetDoc(doc(db, 'storyboard_scenes', sceneId), newScene, { merge: true });
      addToast('Adegan storyboard berhasil disimpan!', 'success');
    } catch (err: any) {
      addToast(`Gagal menyimpan adegan: ${err.message}`, 'error');
    }
  };

  // Reorder Storyboard Shot
  const handleMoveShot = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredStoryboard.length) return;

    const newScenes = [...filteredStoryboard];
    const currentItem = newScenes[index];
    const targetItem = newScenes[targetIndex];

    const currentOrder = currentItem.shot_order;
    currentItem.shot_order = targetItem.shot_order;
    targetItem.shot_order = currentOrder;

    newScenes[index] = targetItem;
    newScenes[targetIndex] = currentItem;

    setStoryboardScenes((prev) => {
      const map = new Map(newScenes.map((s) => [s.id, s]));
      return prev.map((s) => map.get(s.id) || s).sort((a, b) => a.shot_order - b.shot_order);
    });

    try {
      await safeSetDoc(doc(db, 'storyboard_scenes', currentItem.id), { shot_order: currentItem.shot_order }, { merge: true });
      await safeSetDoc(doc(db, 'storyboard_scenes', targetItem.id), { shot_order: targetItem.shot_order }, { merge: true });
    } catch (e) {
      console.warn('Reorder sync error:', e);
    }
  };

  // Toggle Star / Highlight Scene
  const handleToggleStar = async (scene: StoryboardScene) => {
    const updatedStatus = !scene.is_starred;
    const updated = { ...scene, is_starred: updatedStatus };
    setStoryboardScenes((prev) => prev.map((s) => (s.id === scene.id ? updated : s)));
    try {
      await safeSetDoc(doc(db, 'storyboard_scenes', scene.id), { is_starred: updatedStatus }, { merge: true });
    } catch (err) {
      console.warn('Star toggle error:', err);
    }
  };

  // Delete Storyboard Scene
  const handleDeleteStoryScene = async (id: string) => {
    if (!confirm('Hapus frame adegan storyboard ini?')) return;
    setStoryboardScenes((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'storyboard_scenes', id));
      addToast('Adegan storyboard berhasil dihapus.', 'info');
    } catch (err: any) {
      console.warn('Delete story scene error:', err);
    }
  };

  // Convert / Export to Production Shotlist
  const handleExportToShotlist = async (scene: StoryboardScene) => {
    const targetProjectId = scene.project_id !== 'general' ? scene.project_id : 'SHOT-SYNCED';
    const shotItem = {
      id: `shot-${Date.now()}`,
      shotNo: `${scene.scene_number} / ${scene.shot_number}`,
      framing: `${scene.shot_type} (${scene.camera_lens})`,
      description: scene.action_description,
      talent: 'Talent & Cast Utama',
      props: 'Lihat catatan art department',
      equipment: `${scene.camera_movement} • ${scene.camera_lens}`,
      notes: `Lighting: ${scene.lighting_notes || 'Natural/Standard'}. Audio Cue: ${scene.dialogue_or_audio || '-'}`,
      imgUrls: scene.image_url ? [scene.image_url] : [],
    };

    try {
      // Create new shotlist record or sync to existing
      const docId = `SL-${scene.project_id || 'STORYBOARD-EXPORT'}`;
      await safeSetDoc(
        doc(db, 'shotlists', docId),
        {
          id: docId,
          projectName: scene.title,
          clientName: 'Internal Production Sync',
          photographer: currentUser?.full_name || 'Cinematographer',
          location: 'Studio / Location Set',
          date: new Date().toISOString().split('T')[0],
          callTime: '07:30',
          wrapTime: '18:00',
          camRoll: 'CAM_A_STORYBOARD',
          shots: [shotItem],
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      addToast(`Shot ${scene.shot_number} berhasil dikirim ke Production Shot List!`, 'success');
    } catch (err: any) {
      addToast(`Gagal menyinkronkan ke shotlist: ${err.message}`, 'error');
    }
  };

  // Handle Image Upload for Moodboard Modal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, inputTargetId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      addToast('Format file ditolak: Gambar yang diunggah wajib berformat .WEBP atau gunakan link URL.', 'error');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, 'storyboard_assets');
      const inputEl = document.getElementById(inputTargetId) as HTMLInputElement;
      if (inputEl) {
        inputEl.value = url;
      }
      addToast('Gambar berhasil diunggah ke storage!', 'success');
    } catch (err: any) {
      addToast(`Gagal mengunggah gambar: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Print Storyboard Deck
  const handlePrint = () => {
    window.print();
  };

  const totalDuration = filteredStoryboard.reduce((acc, s) => acc + (s.est_duration_sec || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 print:bg-white print:p-0">
      {/* Header Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#005DDD]/10 text-[#005DDD] shrink-0">
                  <Clapperboard className="w-5 h-5" />
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Creative Moodboard & Storyboard Deck
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Pra-Produksi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Kanvas arahan visual, color palette, lighting mood, dan blocking adegan sinematik per scene.
              </p>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Project Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shrink-0 max-w-full">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="all">Semua Proyek Aktif</option>
                  <option value="general">Umum / In-House Studio</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.client_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('storyboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'storyboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-[#005DDD]" />
                  <span>Storyboard ({filteredStoryboard.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('moodboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'moodboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  <span>Moodboard Deck ({filteredMoodboard.length})</span>
                </button>
              </div>

              {/* Pitch Mode Button */}
              {activeTab === 'storyboard' && filteredStoryboard.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPitchIndex(0);
                    setIsPitchMode(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  title="Masuk ke Fullscreen Pitch Deck untuk presentasi ke klien"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Presentasi Klien</span>
                </button>
              )}

              {/* Print Deck Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                title="Cetak dokumen storyboard A4 atau simpan ke PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              {/* Primary Add Button */}
              {activeTab === 'storyboard' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStoryScene(null);
                    setIsStoryModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Shot Baru</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMoodItem(null);
                    setIsMoodModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Referensi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* STORYBOARD VIEW */}
        {activeTab === 'storyboard' && (
          <div className="space-y-6">
            {/* Storyboard Summary Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs print:hidden">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Total Adegan:</span>{' '}
                  <span className="font-bold text-slate-800">{filteredStoryboard.length} Shot</span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-400">Estimasi Durasi Video:</span>{' '}
                  <span className="font-bold text-slate-800">
                    {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-400">Rasio Frame Utama:</span>{' '}
                  <span className="font-bold text-[#005DDD]">16:9 DCI Scope</span>
                </div>
              </div>

              <div className="text-[11px] sm:text-xs text-slate-500 italic">
                Tips: Gunakan tombol panah di kartu untuk menata urutan alur cerita (shot sequencing).
              </div>
            </div>

            {/* Storyboard Grid */}
            {filteredStoryboard.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#005DDD] mx-auto flex items-center justify-center">
                  <Film className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Belum Ada Frame Storyboard</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Mulai rancang adegan demi adegan visual iklan komersial Anda lengkap dengan pergerakan kamera, tipe framing, dan durasi scene.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#004bb5] transition-all cursor-pointer"
                >
                  Buat Frame Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 print:grid-cols-2 print:gap-4">
                {filteredStoryboard.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group print:break-inside-avoid print:shadow-none print:border-slate-300"
                  >
                    {/* Frame Visual / Aspect Ratio 16:9 */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={scene.image_url}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold border border-white/20">
                            {scene.scene_number} • {scene.shot_number}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-blue-600/90 text-white text-[10px] font-bold">
                            {scene.est_duration_sec}s
                          </span>
                        </div>

                        <div className="flex items-center gap-1 pointer-events-auto print:hidden">
                          <button
                            type="button"
                            onClick={() => handleToggleStar(scene)}
                            className={`p-1.5 rounded-md backdrop-blur-xs transition-colors cursor-pointer ${
                              scene.is_starred
                                ? 'bg-amber-500 text-white'
                                : 'bg-black/60 text-white/80 hover:bg-black'
                            }`}
                            title={scene.is_starred ? 'Bintang aktif' : 'Tandai sebagai Hero Shot'}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Technical Spec Pill on Frame */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90 drop-shadow-md">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                          <Camera className="w-3 h-3 text-[#38BDF8]" />
                          <span>{scene.shot_type}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                          <Video className="w-3 h-3 text-emerald-400" />
                          <span>{scene.camera_movement}</span>
                        </div>
                      </div>
                    </div>

                    {/* Frame Details & Narrative Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Title & Lens */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                            {scene.title}
                          </h4>
                        </div>

                        {/* Lens & Lighting Badge */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
                            🔍 {scene.camera_lens}
                          </span>
                          {scene.lighting_notes && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 truncate max-w-[200px]">
                              💡 {scene.lighting_notes}
                            </span>
                          )}
                        </div>

                        {/* Action Description */}
                        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                            Visual Action / Blocking:
                          </span>
                          {scene.action_description}
                        </div>

                        {/* Dialogue / Audio Cue */}
                        {scene.dialogue_or_audio && (
                          <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/60">
                            <span className="font-bold text-[#005DDD] block text-[10px] uppercase tracking-wider mb-0.5">
                              Audio & Dialogue Cue:
                            </span>
                            "{scene.dialogue_or_audio}"
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveShot(idx, 'up')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Pindah ke depan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
                            #{scene.shot_order}
                          </span>
                          <button
                            type="button"
                            disabled={idx === filteredStoryboard.length - 1}
                            onClick={() => handleMoveShot(idx, 'down')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Pindah ke belakang"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleExportToShotlist(scene)}
                            className="px-2 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Kirim ke modul Production Shotlist lapangan"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim ke Shotlist</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingStoryScene(scene);
                              setIsStoryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Adegan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStoryScene(scene.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Frame"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOODBOARD VIEW */}
        {activeTab === 'moodboard' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" /> Kategori:
              </span>
              {(
                [
                  { id: 'all', label: 'Semua Referensi' },
                  { id: 'color_palette', label: '🎨 Color & Tone' },
                  { id: 'lighting', label: '💡 Lighting & Mood' },
                  { id: 'location', label: '📍 Lokasi & Set' },
                  { id: 'wardrobe', label: '👗 Wardrobe & Styling' },
                  { id: 'cinematography', label: '🎥 Referensi Kamera' },
                  { id: 'art_props', label: '📦 Art & Props' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMoodCategoryFilter(cat.id as MoodboardCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    moodCategoryFilter === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Moodboard Masonry / Responsive Grid */}
            {filteredMoodboard.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 mx-auto flex items-center justify-center">
                  <Palette className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Kanvas Moodboard Kosong</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Kumpulkan referensi visual, palet warna HEX, acuan lighting, dan wardrobe untuk kesatuan estetika proyek agensi Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoodModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#004bb5] transition-all cursor-pointer"
                >
                  Tambah Referensi Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2">
                {filteredMoodboard.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Image Aspect ratio container */}
                    <div
                      className={`relative bg-slate-900 overflow-hidden ${
                        item.aspect_ratio === '9:16'
                          ? 'aspect-[9/16]'
                          : item.aspect_ratio === '4:3'
                          ? 'aspect-4/3'
                          : 'aspect-video'
                      }`}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Category Badge Overlay */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Aspect Ratio Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-slate-300 text-[10px] font-mono">
                          {item.aspect_ratio || '16:9'}
                        </span>
                      </div>
                    </div>

                    {/* Content & Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {item.title}
                        </h4>

                        {/* Color Chips Palette */}
                        {item.color_codes && item.color_codes.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Color Swatches (Klik untuk Salin HEX):
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.color_codes.map((hex, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleCopyColor(hex)}
                                  className="group/color flex items-center gap-1 px-1.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-mono font-semibold hover:border-slate-400 transition-all cursor-pointer"
                                  title={`Salin ${hex}`}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: hex }}
                                  />
                                  <span>{hex}</span>
                                  {copiedHex === hex ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover/color:opacity-100" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Director Notes */}
                        {item.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMoodItem(item);
                              setIsMoodModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMoodItem(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN PITCH DECK PRESENTATION MODE */}
      {isPitchMode && filteredStoryboard.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-[#005DDD] text-white font-mono font-bold text-xs">
                {filteredStoryboard[pitchIndex].scene_number} • {filteredStoryboard[pitchIndex].shot_number}
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {filteredStoryboard[pitchIndex].title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 font-mono">
                Frame {pitchIndex + 1} dari {filteredStoryboard.length} (Gunakan ← / →)
              </span>
              <button
                type="button"
                onClick={() => setIsPitchMode(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Keluar dari Pitch Mode (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center High-Res Frame Display */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
            <div className="max-w-5xl max-h-[70vh] w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-zinc-950 flex items-center justify-center">
              <img
                src={filteredStoryboard[pitchIndex].image_url}
                alt={filteredStoryboard[pitchIndex].title}
                className="w-full h-full object-contain"
              />

              {/* Technical Badge Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-sky-400 font-mono text-xs border border-white/10">
                  {filteredStoryboard[pitchIndex].shot_type}
                </span>
                <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-emerald-400 font-mono text-xs border border-white/10">
                  {filteredStoryboard[pitchIndex].camera_movement}
                </span>
                <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-400 font-mono text-xs border border-white/10">
                  {filteredStoryboard[pitchIndex].camera_lens}
                </span>
              </div>
            </div>

            {/* Prev / Next Click Overlays */}
            <button
              type="button"
              onClick={() => setPitchIndex((prev) => (prev > 0 ? prev - 1 : filteredStoryboard.length - 1))}
              className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setPitchIndex((prev) => (prev < filteredStoryboard.length - 1 ? prev + 1 : 0))}
              className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Narrative Strip */}
          <div className="p-6 bg-zinc-950/90 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Visual Action & Blocking:
              </span>
              <p className="text-sm text-white/90 leading-relaxed font-light">
                {filteredStoryboard[pitchIndex].action_description}
              </p>
            </div>
            {filteredStoryboard[pitchIndex].dialogue_or_audio && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                  Audio & Dialogue Cue:
                </span>
                <p className="text-sm text-sky-100/90 italic leading-relaxed">
                  "{filteredStoryboard[pitchIndex].dialogue_or_audio}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STORYBOARD SCENE */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#005DDD]/10 text-[#005DDD]">
                  <Film className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingStoryScene ? 'Edit Frame Storyboard' : 'Tambah Frame Storyboard Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsStoryModalOpen(false);
                  setEditingStoryScene(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoryScene} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Scene</label>
                  <input
                    type="text"
                    name="scene_number"
                    required
                    defaultValue={editingStoryScene?.scene_number || 'Scene 01'}
                    placeholder="Contoh: Scene 01"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Shot</label>
                  <input
                    type="text"
                    name="shot_number"
                    required
                    defaultValue={editingStoryScene?.shot_number || 'Shot 1A'}
                    placeholder="Contoh: Shot 1A"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Detik)</label>
                  <input
                    type="number"
                    name="est_duration_sec"
                    min="1"
                    max="120"
                    defaultValue={editingStoryScene?.est_duration_sec || 4}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Konsep Adegan</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingStoryScene?.title || ''}
                    placeholder="Contoh: Model Melangkah Keluar Lift"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tautkan ke Proyek</label>
                  <select
                    name="project_id"
                    defaultValue={editingStoryScene?.project_id || selectedProjectId}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="general">Umum / In-House Zekalian</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.client_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Camera & Lens Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Framing / Shot Type</label>
                  <select
                    name="shot_type"
                    defaultValue={editingStoryScene?.shot_type || 'Medium Shot (MS)'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="Extreme Close-Up (ECU)">Extreme Close-Up (ECU)</option>
                    <option value="Close-Up (CU)">Close-Up (CU)</option>
                    <option value="Medium Close-Up (MCU)">Medium Close-Up (MCU)</option>
                    <option value="Medium Shot (MS)">Medium Shot (MS)</option>
                    <option value="Full Shot / Wide (WS)">Full Shot / Wide (WS)</option>
                    <option value="Extreme Wide Shot (EWS)">Extreme Wide Shot (EWS)</option>
                    <option value="Over The Shoulder (OTS)">Over The Shoulder (OTS)</option>
                    <option value="POV (Point of View)">POV (Point of View)</option>
                    <option value="Drone / Aerial">Drone / Aerial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pergerakan Kamera</label>
                  <select
                    name="camera_movement"
                    defaultValue={editingStoryScene?.camera_movement || 'Static'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="Static">Static / Tripod</option>
                    <option value="Slow Dolly In">Slow Dolly In</option>
                    <option value="Slow Dolly Out">Slow Dolly Out</option>
                    <option value="Pan Left / Right">Pan Left / Right</option>
                    <option value="Tilt Up / Down">Tilt Up / Down</option>
                    <option value="Tracking Gimbal">Tracking Gimbal</option>
                    <option value="Handheld Cinematic">Handheld Cinematic</option>
                    <option value="Crane / Jib Arc">Crane / Jib Arc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lensa & Iris</label>
                  <input
                    type="text"
                    name="camera_lens"
                    defaultValue={editingStoryScene?.camera_lens || '35mm f/1.4 Cine'}
                    placeholder="Contoh: 35mm f/1.4 Anamorphic"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              {/* Visual Image URL / Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">URL Sketsa / Frame Gambar</label>
                  <ImgbbGuideButton size="xs" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="story_img_url"
                    name="image_url"
                    required
                    defaultValue={editingStoryScene?.image_url || ''}
                    placeholder="https://i.ibb.co/... atau URL gambar langsung"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                  <input
                    type="file"
                    ref={storyFileInputRef}
                    accept="image/webp,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'story_img_url')}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => storyFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Mengunggah...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Action Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Aksi & Blocking Talent
                </label>
                <textarea
                  name="action_description"
                  required
                  rows={3}
                  defaultValue={editingStoryScene?.action_description || ''}
                  placeholder="Ceritakan detail pergerakan talent, orientasi pandangan, dan perubahan posisi di dalam frame..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] resize-none"
                />
              </div>

              {/* Dialogue / Audio Cue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dialog / Voice Over / SFX</label>
                  <input
                    type="text"
                    name="dialogue_or_audio"
                    defaultValue={editingStoryScene?.dialogue_or_audio || ''}
                    placeholder="Contoh: VO: 'Inovasi tanpa henti.' + Suara deburan ombak"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Lighting</label>
                  <input
                    type="text"
                    name="lighting_notes"
                    defaultValue={editingStoryScene?.lighting_notes || ''}
                    placeholder="Contoh: Softbox 120cm + Warm rim light dari belakang"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsStoryModalOpen(false);
                    setEditingStoryScene(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#005DDD] hover:bg-[#004bb5] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Frame Storyboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MOODBOARD ITEM */}
      {isMoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                  <Palette className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingMoodItem ? 'Edit Referensi Moodboard' : 'Tambah Referensi Moodboard Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMoodModalOpen(false);
                  setEditingMoodItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMoodItem} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Inspirasi / Elemen</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingMoodItem?.title || ''}
                  placeholder="Contoh: Golden Hour Lighting & Anamorphic Flare"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pilar</label>
                  <select
                    name="category"
                    defaultValue={editingMoodItem?.category || 'color_palette'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="color_palette">Color Palette & Grading Tone</option>
                    <option value="lighting">Lighting & Composition</option>
                    <option value="location">Location & Set Design</option>
                    <option value="wardrobe">Wardrobe & Styling Talent</option>
                    <option value="cinematography">Cinematography Reference</option>
                    <option value="art_props">Art Department & Props</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proyek Target</label>
                  <select
                    name="project_id"
                    defaultValue={editingMoodItem?.project_id || selectedProjectId}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="general">Umum / Semua Proyek</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL & File Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">URL Foto Referensi Visual</label>
                  <ImgbbGuideButton size="xs" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="mood_img_url"
                    name="image_url"
                    required
                    defaultValue={editingMoodItem?.image_url || ''}
                    placeholder="https://i.ibb.co/... atau URL gambar langsung"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/webp,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'mood_img_url')}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Mengunggah...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Color Hex Codes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Warna HEX (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="color_codes"
                  defaultValue={editingMoodItem?.color_codes?.join(', ') || '#0A2540, #E07A5F, #F4A261'}
                  placeholder="#0A2540, #1C3D5A, #E07A5F"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl outline-none focus:border-[#005DDD]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Contoh: #1E293B, #38BDF8, #F59E0B (Otomatis menghasilkan chip warna yang dapat diklik)
                </span>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rasio Aspek Gambar</label>
                <select
                  name="aspect_ratio"
                  defaultValue={editingMoodItem?.aspect_ratio || '16:9'}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] bg-white"
                >
                  <option value="16:9">16:9 (Landscape / DCI)</option>
                  <option value="4:3">4:3 (Classic Academy)</option>
                  <option value="9:16">9:16 (Vertical Reels / TikTok)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Sutradara & Kru</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingMoodItem?.notes || ''}
                  placeholder="Tuliskan arahan tekstur, filter lensa (Black Pro-Mist), tone warna kulit, atau nuansa set..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#005DDD] resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoodModalOpen(false);
                    setEditingMoodItem(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#005DDD] hover:bg-[#004bb5] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Referensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

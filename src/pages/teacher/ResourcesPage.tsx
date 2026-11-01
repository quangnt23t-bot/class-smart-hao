import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { ResourceItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  FolderOpen,
  Plus,
  Search,
  Star,
  Download,
  Share2,
  Trash2,
  FileText,
  Video,
  Presentation,
  File,
  Eye
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { success, error } = useToast();
  const [resources, setResources] = useState<ResourceItem[]>(StorageService.getResources());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Chương 1 - Số tự nhiên');
  const [lesson, setLesson] = useState('Bài 1 - Tập hợp');
  const [resType, setResType] = useState<ResourceItem['type']>('pdf');

  const filtered = resources.filter(r => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.chapter.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleToggleFavorite = (id: string) => {
    StorageService.toggleFavoriteResource(id);
    setResources(StorageService.getResources());
    success('Đã cập nhật trạng thái yêu thích');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Vui lòng nhập tên tài liệu');
      return;
    }
    const created = StorageService.addResource({
      title: title.trim(),
      grade: 'Khối 6',
      subject: 'Toán học',
      chapter,
      lesson,
      type: resType,
      fileUrl: '#',
      fileSize: '3.4 MB',
      isFavorite: false,
      uploadedBy: 'Cô Nguyễn Thị Lan',
      uploadedAt: new Date().toISOString().split('T')[0]
    });
    setResources(StorageService.getResources());
    success(`Đã thêm học liệu "${created.title}" thành công!`);
    setIsUploadOpen(false);
    setTitle('');
  };

  const getIcon = (type: ResourceItem['type']) => {
    switch (type) {
      case 'ppt':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kho Học liệu & Giáo án điện tử</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị slide bài giảng, sơ đồ tư duy, video minh họa và phiếu bài tập bổ trợ
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tải lên tài liệu mới</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học liệu, bài học, chương..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
        >
          <option value="all">Tất cả định dạng</option>
          <option value="ppt">Slide bài giảng (PowerPoint)</option>
          <option value="pdf">Tài liệu PDF / Đề cương</option>
          <option value="video">Video giảng dạy</option>
        </select>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                  {getIcon(r.type)}
                </div>
                <button
                  onClick={() => handleToggleFavorite(r.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    r.isFavorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${r.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug line-clamp-2">{r.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{r.chapter} · {r.lesson}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{r.fileSize} · {r.downloadsCount} lượt tải</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => success(`Đang tải xuống: ${r.title}`)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Tải xuống"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => success(`Đã sao chép link chia sẻ: ${r.title}`)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Chia sẻ"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Tải lên tài liệu học liệu mới"
        subtitle="Chia sẻ bài giảng, đề cương hoặc tài liệu ôn thi"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề học liệu *</label>
            <input
              type="text"
              required
              placeholder="VD: Giáo án PowerPoint Bài 03..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chương học</label>
              <input
                type="text"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Định dạng file</label>
              <select
                value={resType}
                onChange={e => setResType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="pdf">PDF</option>
                <option value="ppt">PowerPoint (PPT)</option>
                <option value="video">Video</option>
                <option value="doc">Word (Doc)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Tải lên ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

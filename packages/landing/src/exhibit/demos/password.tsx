'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Providers } from '@/exhibit/providers/password/Providers';
import { useData } from '@/exhibit/providers/password/DataProvider';
import { copyToClipboard, clearClipboardAfter } from '@/exhibit/utils/password/format';
import { useToast } from '@/exhibit/providers/password/ToastProvider';
import { VaultItemForm } from '@/exhibit/components/password/molecules/VaultItemForm';
import { ConfirmDialog } from '@/exhibit/components/password/molecules/ConfirmDialog';
import { VaultItemCard } from '@/exhibit/components/password/organisms/VaultItemCard';
import { RecentlyUsed } from '@/exhibit/components/password/organisms/RecentlyUsed';
import { FolderManager } from '@/exhibit/components/password/organisms/FolderManager';
import {
  VaultToolbar,
  type SortKey,
  type DateFilter,
} from '@/exhibit/components/password/organisms/VaultToolbar';
import {
  FiDownload,
  FiFolderPlus,
  FiPlus,
  FiShare2,
  FiTrash2,
} from 'react-icons/fi';
import type { Folder, VaultItem, VaultItemType } from '@/exhibit/types/password';

type SidebarFilter = 'all' | 'favorites' | 'shared' | VaultItemType;
const RECENT_WINDOW = 7 * 86400000;

const dateCutoffs: Record<DateFilter, number> = {
  all: 0,
  week: 7 * 86400000,
  month: 30 * 86400000,
  quarter: 90 * 86400000,
};

const HomeContent: FC = () => {
  const {
    items,
    folders,
    isLoading,
    trashItem,
    createItem,
    updateItem,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolderTeam,
    settings,
  } = useData();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>('all');
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [sort, setSort] = useState<SortKey>('updated');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<VaultItem | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const allTags = [...new Set(items.flatMap((i) => i.tags))].sort();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'k' || key === 'l') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (key === 'n') {
        e.preventDefault();
        setShowAdd(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.username ?? '').toLowerCase().includes(search.toLowerCase());
    const matchSidebar =
      sidebarFilter === 'all'
        ? true
        : sidebarFilter === 'favorites'
          ? i.favorite
          : sidebarFilter === 'shared'
            ? Boolean(i.sharedBy)
            : i.type === sidebarFilter;
    const matchFolder = folderFilter === null || i.folderId === folderFilter;
    const matchTag = tagFilter === null || i.tags.includes(tagFilter);
    const matchDate =
      dateFilter === 'all' ||
      i.updatedAt >= Date.now() - dateCutoffs[dateFilter];
    return matchSearch && matchSidebar && matchFolder && matchTag && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title);
    if (sort === 'used') return (b.lastUsed ?? 0) - (a.lastUsed ?? 0);
    return b.updatedAt - a.updatedAt;
  });

  const recentItems =
    sidebarFilter === 'all' &&
    !search &&
    !selectMode &&
    !folderFilter &&
    !tagFilter
      ? items
          .filter(
            (i) =>
              i.lastUsed !== undefined &&
              Date.now() - i.lastUsed < RECENT_WINDOW
          )
          .sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0))
          .slice(0, 4)
      : [];

  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text);
    clearClipboardAfter(settings.clipboardClear);
    addToast(`${label} copied`, 'success');
  };

  const handleToggleSelectMode = () => {
    setSelectMode((m) => {
      if (m) setSelectedIds([]);
      return !m;
    });
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const handleDropOnFolder = async (folder: Folder) => {
    if (dragItemId) {
      await updateItem(dragItemId, { folderId: folder.id });
      addToast(`Moved to ${folder.name}`, 'success');
    }
    setDragItemId(null);
    setDragOverFolder(null);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    if (folderFilter === id) setFolderFilter(null);
    addToast('Folder deleted', 'info');
  };

  const sidebarButton = (value: SidebarFilter, label: string) => (
    <button
      type="button"
      onClick={() => setSidebarFilter(value)}
      className={`w-full rounded px-3 py-2 text-left text-sm ${sidebarFilter === value ? 'bg-primary/20 ring-primary ring-1' : 'hover:bg-base-200'}`}>
      {label}
    </button>
  );

  const folderButton = (f: Folder) => (
    <button
      key={f.id}
      type="button"
      onClick={() => setFolderFilter(folderFilter === f.id ? null : f.id)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverFolder(f.id);
      }}
      onDragLeave={() => setDragOverFolder(null)}
      onDrop={(e) => {
        e.preventDefault();
        handleDropOnFolder(f);
      }}
      className={`w-full rounded px-3 py-2 text-left text-sm ${dragOverFolder === f.id ? 'bg-primary/20 ring-primary ring-1' : folderFilter === f.id ? 'bg-primary/20 ring-primary ring-1' : 'hover:bg-base-200'}`}>
      {f.name}
    </button>
  );

  return (
    <div className="bg-base-100 min-h-screen">
      <header className="border-base-300 bg-base-100 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-bold">Password Vault</h1>
        <div className="flex gap-2">
          <Link href="/design-system/exhibits/password" className="btn btn-ghost btn-sm">
            Generator
          </Link>
          <Link href="/design-system/exhibits/password" className="btn btn-ghost btn-sm">
            Health
          </Link>
          <Link href="/design-system/exhibits" className="btn btn-ghost btn-sm gap-1.5">
            <FiDownload className="size-4" /> Downloads
          </Link>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="btn btn-primary btn-sm">
            <FiPlus className="size-4" /> New
          </button>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl gap-6 p-6">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 md:flex">
          {sidebarButton('all', 'All items')}
          {sidebarButton('favorites', 'Favorites')}
          <div className="divider my-1" />
          <p className="text-base-content/50 px-3 text-xs uppercase">
            Categories
          </p>
          {sidebarButton('login', 'Logins')}
          {sidebarButton('card', 'Cards')}
          {sidebarButton('identity', 'Identities')}
          {sidebarButton('note', 'Notes')}
          {sidebarButton('ssh', 'SSH Keys')}
          <div className="divider my-1" />
          <button
            type="button"
            onClick={() =>
              setSidebarFilter(sidebarFilter === 'shared' ? 'all' : 'shared')
            }
            className={`flex items-center gap-2 rounded px-3 py-2 text-left text-sm ${sidebarFilter === 'shared' ? 'bg-primary/20 ring-primary ring-1' : 'hover:bg-base-200'}`}>
            <FiShare2 className="size-4" /> Shared with me
          </button>
          <div className="mt-2 space-y-1">
            <div className="divider my-1" />
            <div className="flex items-center justify-between px-1">
              <p className="text-base-content/50 px-2 text-xs uppercase">
                Folders
              </p>
              <button
                type="button"
                aria-label="Manage folders"
                onClick={() => setShowFolders(true)}
                className="btn btn-ghost btn-xs btn-circle">
                <FiFolderPlus className="size-4" />
              </button>
            </div>
            {folders.filter((f) => !f.isTeam).map(folderButton)}
            {folders.filter((f) => !f.isTeam).length === 0 && (
              <p className="text-base-content/50 px-3 text-xs">No folders</p>
            )}
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-base-content/50 px-3 text-xs uppercase">
              Team vaults
            </p>
            {folders
              .filter((f) => f.isTeam)
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setFolderFilter(folderFilter === f.id ? null : f.id)
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolder(f.id);
                  }}
                  onDragLeave={() => setDragOverFolder(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnFolder(f);
                  }}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${dragOverFolder === f.id || folderFilter === f.id ? 'bg-primary/20 ring-primary ring-1' : 'hover:bg-base-200'}`}>
                  <span className="badge badge-primary badge-sm">Team</span>
                  {f.name}
                </button>
              ))}
            {folders.filter((f) => f.isTeam).length === 0 && (
              <p className="text-base-content/50 px-3 text-xs">
                No team vaults
              </p>
            )}
          </div>
          <div className="divider my-1" />
          <Link
            href="/design-system/exhibits/password"
            className="text-base-content/70 hover:bg-base-200 flex items-center gap-2 rounded px-3 py-2 text-sm">
            <FiTrash2 className="size-4" /> Trash
          </Link>
        </aside>
        <div className="min-w-0 flex-1">
          <VaultToolbar
            search={search}
            onSearchChange={setSearch}
            searchRef={searchRef}
            sort={sort}
            onSortChange={setSort}
            selectMode={selectMode}
            onToggleSelectMode={handleToggleSelectMode}
            folders={folders}
            folderFilter={folderFilter}
            onFolderFilterChange={setFolderFilter}
            allTags={allTags}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />
          {selectMode && sorted.length > 0 && (
            <div className="bg-base-200 mb-4 flex items-center justify-between gap-2 rounded-lg p-2">
              <span className="text-sm">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(sorted.map((i) => i.id))}
                  className="btn btn-ghost btn-xs">
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="btn btn-ghost btn-xs">
                  Clear
                </button>
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={() => setConfirmBulk(true)}
                  className="btn btn-error btn-xs">
                  Delete
                </button>
              </div>
            </div>
          )}
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {(
              [
                'all',
                'shared',
                'login',
                'card',
                'identity',
                'note',
                'ssh',
              ] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSidebarFilter(t)}
                className={`btn btn-xs ${sidebarFilter === t ? 'btn-primary' : 'btn-ghost'}`}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <RecentlyUsed items={recentItems} />
              <motion.div
                key={`${sidebarFilter}-${sort}-${folderFilter}-${tagFilter}-${dateFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-2">
                {sorted.map((item) => (
                  <VaultItemCard
                    key={item.id}
                    item={item}
                    selectMode={selectMode}
                    selected={selectedIds.includes(item.id)}
                    onToggleSelect={toggleSelect}
                    onCopy={handleCopy}
                    onDeleteRequest={setConfirmDelete}
                    onDragStart={setDragItemId}
                    onDragEnd={() => setDragItemId(null)}
                  />
                ))}
                {sorted.length === 0 && (
                  <p className="text-base-content/50 py-8 text-center">
                    No items found
                  </p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 card max-h-[90vh] w-full max-w-md overflow-y-auto shadow-xl">
            <div className="card-body">
              <h2 className="card-title">New Item</h2>
              <VaultItemForm
                submitLabel="Create"
                onCancel={() => setShowAdd(false)}
                onSubmit={async (data) => {
                  await createItem(data);
                  setShowAdd(false);
                  addToast('Item created', 'success');
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showFolders && (
        <FolderManager
          folders={folders}
          onClose={() => setShowFolders(false)}
          onCreate={async (name, isTeam) => {
            await createFolder(name, isTeam);
            addToast(
              isTeam ? 'Team vault created' : 'Folder created',
              'success'
            );
          }}
          onRename={async (id, name) => {
            await renameFolder(id, name);
            addToast('Folder renamed', 'success');
          }}
          onToggleTeam={async (id) => {
            await toggleFolderTeam(id);
            addToast('Team vault status updated', 'success');
          }}
          onDelete={handleDeleteFolder}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Move item to trash?"
          message={`Move "${confirmDelete.title}" to trash? You can restore it from the trash for 30 days.`}
          onConfirm={async () => {
            await trashItem(confirmDelete.id);
            setConfirmDelete(null);
            addToast('Moved to trash', 'info');
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmBulk && (
        <ConfirmDialog
          title="Move selected items to trash?"
          message={`Move ${selectedIds.length} selected item(s) to trash? You can restore them from the trash for 30 days.`}
          onConfirm={async () => {
            for (const id of selectedIds) await trashItem(id);
            setConfirmBulk(false);
            setSelectMode(false);
            setSelectedIds([]);
            addToast(`${selectedIds.length} items moved to trash`, 'info');
          }}
          onCancel={() => setConfirmBulk(false)}
        />
      )}
    </div>
  );
};

const HomePage: FC = () => (
  <Providers>
    <HomeContent />
  </Providers>
);
export default HomePage;

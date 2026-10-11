'use client';

import React, { useEffect, useState } from 'react';
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState, Input, Skeleton, Textarea, useConfirm, useToast } from 'strata';

import { createNote, deleteNote, getNotes, updateNote } from '@/app/actions/notes';
import type { Note } from '@/types';

const byRecent = (a: Note, b: Note) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt);

/** Notas rápidas: crear, editar en el sitio, fijar y eliminar. */
export default function NotesWidget() {
  const toast = useToast();
  const confirm = useConfirm();
  const [notes, setNotes] = useState<Note[] | null>(null);
  // `editing` es el id de la nota abierta, o 'new' para la nota nueva.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', content: '' });

  useEffect(() => {
    getNotes()
      .then((list) => setNotes(list.sort(byRecent)))
      .catch(() => {
        toast({ tone: 'error', message: 'No se pudieron cargar las notas.' });
        setNotes([]);
      });
  }, [toast]);

  const open = (note: Note | null) => {
    setEditing(note?.id ?? 'new');
    setDraft({ title: note?.title ?? '', content: note?.content ?? '' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    try {
      if (editing === 'new') {
        const created = await createNote({ title, content: draft.content });
        setNotes((list) => [created, ...(list ?? [])].sort(byRecent));
      } else if (editing) {
        await updateNote(editing, { title, content: draft.content });
        setNotes((list) => (list ?? []).map((n) => (n.id === editing ? { ...n, title, content: draft.content, updatedAt: new Date() } : n)).sort(byRecent));
      }
      setEditing(null);
    } catch {
      toast({ tone: 'error', message: 'No se pudo guardar la nota.' });
    }
  };

  const togglePin = async (note: Note) => {
    const isPinned = !note.isPinned;
    setNotes((list) => (list ?? []).map((n) => (n.id === note.id ? { ...n, isPinned } : n)).sort(byRecent));
    try {
      await updateNote(note.id, { isPinned });
    } catch {
      setNotes((list) => (list ?? []).map((n) => (n.id === note.id ? { ...n, isPinned: note.isPinned } : n)).sort(byRecent));
      toast({ tone: 'error', message: 'No se pudo fijar la nota.' });
    }
  };

  const remove = async (note: Note) => {
    if (!(await confirm({ title: 'Eliminar nota', message: `«${note.title}» se eliminará.`, confirmLabel: 'Eliminar' }))) return;
    try {
      await deleteNote(note.id);
      setNotes((list) => (list ?? []).filter((n) => n.id !== note.id));
      if (editing === note.id) setEditing(null);
    } catch {
      toast({ tone: 'error', message: 'No se pudo eliminar la nota.' });
    }
  };

  if (!notes) return <Skeleton className="h-24 w-full" />;

  const form = (
    <form onSubmit={save} className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-2.5">
      <Input className="py-1.5" aria-label="Título de la nota" placeholder="Título" maxLength={120} autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      <Textarea aria-label="Contenido de la nota" rows={4} placeholder="Escribe aquí…" maxLength={5000} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!draft.title.trim()}>
          Guardar
        </Button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col gap-2">
      {editing === 'new' ? (
        form
      ) : (
        <Button variant="secondary" size="sm" onClick={() => open(null)}>
          <Plus className="h-4 w-4" /> Nueva nota
        </Button>
      )}
      {notes.length === 0 && editing !== 'new' && <EmptyState title="Sin notas" description="Apunta ideas, sensaciones o recordatorios." />}
      {notes.map((note) =>
        editing === note.id ? (
          <React.Fragment key={note.id}>{form}</React.Fragment>
        ) : (
          <article key={note.id} className="group rounded-xl border border-border p-2.5">
            <div className="flex items-start gap-1">
              <button className="min-w-0 flex-1 text-left" aria-label={`Editar ${note.title}`} onClick={() => open(note)}>
                <h4 className="truncate text-sm font-semibold">{note.title}</h4>
                {note.content && <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-xs text-muted">{note.content}</p>}
              </button>
              <button aria-label={note.isPinned ? `Desfijar ${note.title}` : `Fijar ${note.title}`} className={`rounded p-1 hover:text-fg ${note.isPinned ? 'text-accent' : 'text-muted opacity-0 group-hover:opacity-100 focus:opacity-100'}`} onClick={() => togglePin(note)}>
                {note.isPinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
              </button>
              <button aria-label={`Eliminar ${note.title}`} className="rounded p-1 text-muted opacity-0 hover:text-fg group-hover:opacity-100 focus:opacity-100" onClick={() => remove(note)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

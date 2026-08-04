"use client";

import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete01Icon,
  Loading03Icon,
  Maximize02Icon,
  MinusSignIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Share07Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeProps,
  type OnNodeDrag,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createNote,
  deleteNote,
  getRoomNotes,
  subscribeToRoomNotes,
  updateNoteContent,
  updateNotePosition,
} from "@/lib/supabase/queries/notes";
import { getCurrentProfile } from "@/lib/supabase/queries/profiles";
import { subscribeToRoomPresence, type RoomPresenceSubscription } from "@/lib/supabase/queries/presence";
import { getRoomMembers } from "@/lib/supabase/queries/room-members";
import { getRoom } from "@/lib/supabase/queries/rooms";
import type { Note, NoteColor, NoteDragPayload, PresenceState, Profile, Room, RoomMember } from "@/lib/supabase/types";

type Member = {
  name: string;
  initials: string;
  role: string;
  color: string;
  active?: boolean;
};

type StickyNoteData = {
  body: string;
  author: string;
  createdAt?: string;
  color: NoteColor;
  isDraft?: boolean;
  roomId?: string;
};

type StickyNoteNode = Node<StickyNoteData, "sticky-note">;

type RoomEditingContextValue = {
  currentUserId: string;
  editingByNoteId: PresenceState["editingByNoteId"];
  onEditingChange: (noteId: string) => void;
  onEditingEnd: (noteId: string) => void;
};

const RoomEditingContext = createContext<RoomEditingContextValue | null>(null);

const memberColors = ["bg-primary", "bg-chart-2", "bg-secondary", "bg-chart-3"];
const noteColorOptions: NoteColor[] = ["primary", "secondary", "chart", "muted"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRelativeTime(timestamp: string, now = Date.now()) {
  const createdAt = Date.parse(timestamp);

  if (Number.isNaN(createdAt)) {
    return "recently";
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - createdAt) / 1000));

  if (elapsedSeconds < 60) {
    return "just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function useRelativeTime(timestamp?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => window.clearInterval(intervalId);
  }, [timestamp]);

  return timestamp ? formatRelativeTime(timestamp, now) : "new note";
}

function toMember(member: RoomMember, index: number, onlineUserIds: Set<string>): Member {
  return {
    name: member.display_name,
    initials: getInitials(member.display_name) || "U",
    role: member.role === "owner" ? "Host" : "Member",
    color: memberColors[index % memberColors.length],
    active: onlineUserIds.has(member.user_id),
  };
}

function toNoteNode(note: Note, memberNames: Map<string, string>): StickyNoteNode {
  const author = memberNames.get(note.created_by) ?? "User";

  return {
    id: note.id,
    type: "sticky-note",
    position: { x: note.position_x, y: note.position_y },
    data: {
      body: note.content,
      author,
      createdAt: note.created_at,
      color: note.color,
    },
  };
}

const noteColors = {
  primary: {
    surface: "bg-primary/12",
    accent: "bg-primary",
    icon: "text-primary",
  },
  secondary: {
    surface: "bg-secondary/18",
    accent: "bg-secondary",
    icon: "text-secondary",
  },
  chart: {
    surface: "bg-chart-2/16",
    accent: "bg-chart-2",
    icon: "text-chart-2",
  },
  muted: {
    surface: "bg-muted",
    accent: "bg-muted-foreground/60",
    icon: "text-muted-foreground",
  },
};

type NoteSaveState = "idle" | "saving" | "saved" | "error" | "deleting";

function StickyNote({ id, data, selected, dragging }: NodeProps<StickyNoteNode>) {
  const colors = noteColors[data.color];
  const timestamp = useRelativeTime(data.createdAt);
  const { getNode, setNodes } = useReactFlow<StickyNoteNode>();
  const editingContext = useContext(RoomEditingContext);
  const isEditingRef = useRef(false);
  const [body, setBody] = useState(data.body);
  const [savedBody, setSavedBody] = useState(data.body);
  const [saveState, setSaveState] = useState<NoteSaveState>(data.isDraft ? "idle" : "saved");
  const [saveMessage, setSaveMessage] = useState(data.isDraft ? "Press Enter to save" : "Saved");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setBody(data.body);
    setSavedBody(data.body);
    setSaveState(data.isDraft ? "idle" : "saved");
    setSaveMessage(data.isDraft ? "Press Enter to save" : "Saved");
  }, [data.body, data.isDraft]);

  const otherEditors = data.isDraft || !editingContext
    ? []
    : (editingContext.editingByNoteId[id] ?? []).filter(
        (editor) => editor.userId !== editingContext.currentUserId,
      );
  const isEditedByOther = otherEditors.length > 0;
  const editorNames = otherEditors.map((editor) => editor.displayName).join(", ");

  useEffect(() => {
    if (data.isDraft || !editingContext?.onEditingEnd) {
      return;
    }

    return () => {
      if (isEditingRef.current) {
        editingContext.onEditingEnd(id);
      }
    };
  }, [data.isDraft, editingContext?.onEditingEnd, id]);

  async function saveBody() {
    const nextBody = body.trim();

    if (!nextBody) {
      setBody(savedBody);
      setSaveState("error");
      setSaveMessage("Note can't be empty");
      return;
    }

    if (nextBody === savedBody) {
      setBody(nextBody);
      setSaveState("saved");
      setSaveMessage("Saved");
      return;
    }

    setSaveState("saving");
    setSaveMessage("Saving…");

    const { error } = await updateNoteContent(id, nextBody);

    if (error) {
      setSaveState("error");
      setSaveMessage("Couldn't save");
      return;
    }

    setBody(nextBody);
    setSavedBody(nextBody);
    setSaveState("saved");
    setSaveMessage("Saved");
    setNodes((currentNodes) =>
      currentNodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, body: nextBody } } : node)),
    );
  }

  async function saveDraft() {
    const nextBody = body.trim();

    if (!nextBody) {
      setSaveState("error");
      setSaveMessage("Write something first");
      return;
    }

    const draftNode = getNode(id);

    if (!draftNode || !data.roomId) {
      setSaveState("error");
      setSaveMessage("Couldn't create note");
      return;
    }

    setSaveState("saving");
    setSaveMessage("Saving…");

    const { data: savedNote, error } = await createNote(data.roomId, nextBody, draftNode.position, data.color);

    if (error || !savedNote) {
      setSaveState("error");
      setSaveMessage(error?.message ?? "Couldn't create note");
      return;
    }

    setBody(nextBody);
    setSavedBody(nextBody);
    setSaveState("saved");
    setSaveMessage("Saved");
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? {
              ...node,
              id: savedNote.id,
              data: {
                ...node.data,
                body: savedNote.content,
                createdAt: savedNote.created_at,
                isDraft: false,
                roomId: undefined,
              },
            }
          : node,
      ),
    );
  }

  async function removeNote() {
    if (data.isDraft || isEditedByOther) {
      return;
    }

    setDeleteDialogOpen(false);
    setSaveState("deleting");
    setSaveMessage("Deleting…");

    const { error } = await deleteNote(id);

    if (error) {
      setSaveState("error");
      setSaveMessage("Couldn't delete");
      return;
    }

    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
  }

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <article
        className={cn(
          "w-58 rounded-xl border border-border/80 p-4 text-card-foreground shadow-lg shadow-background/20 transition-[box-shadow,transform,opacity] duration-150",
          colors.surface,
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          dragging && "cursor-grabbing opacity-95 shadow-2xl",
          !dragging && "cursor-grab hover:-translate-y-0.5 hover:shadow-xl",
        )}
        aria-label={`Note by ${data.author}: ${body}`}
      >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("size-2 rounded-full", colors.accent)} />
        {isEditedByOther ? (
          <span
            className="inline-flex min-w-0 items-center gap-1 text-[0.65rem] font-medium text-primary"
            role="status"
            title={`${editorNames} ${otherEditors.length === 1 ? "is" : "are"} editing this note`}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={12} strokeWidth={2} aria-hidden="true" />
            <span className="truncate">
              {otherEditors.length === 1 ? `${editorNames} editing` : `${otherEditors.length} people editing`}
            </span>
          </span>
        ) : (
          <span suppressHydrationWarning className="text-[0.65rem] font-medium text-muted-foreground">
            {timestamp}
          </span>
        )}
      </div>
      <Textarea
        value={body}
        onFocus={() => {
          if (!data.isDraft && !isEditedByOther) {
            isEditingRef.current = true;
            editingContext?.onEditingChange(id);
          }
        }}
        onChange={(event) => {
          setBody(event.target.value);
          setSaveState("idle");
          setSaveMessage(data.isDraft ? "Press Enter to save" : "Unsaved changes");
        }}
        onBlur={() => {
          if (!data.isDraft) {
            isEditingRef.current = false;
            void saveBody().finally(() => editingContext?.onEditingEnd(id));
          }
        }}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void (data.isDraft ? saveDraft() : saveBody());
          }
        }}
        autoFocus={data.isDraft}
        disabled={saveState === "saving" || saveState === "deleting" || isEditedByOther}
        aria-label={
          isEditedByOther
            ? `${editorNames} is editing this note`
            : data.isDraft
              ? "Write a new note"
              : `Edit note by ${data.author}`
        }
        placeholder="Write a note…"
        spellCheck
        className="nodrag nowheel mt-4 h-28 min-h-28 rounded-lg border-border/70 bg-background/40 px-3 py-2.5 text-sm font-medium leading-6 tracking-[-0.01em] shadow-inner shadow-background/5 placeholder:text-muted-foreground/70 focus-visible:bg-background/65"
      />
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-[0.65rem] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-bold", colors.surface, colors.icon)}>
            {getInitials(data.author) || "U"}
          </span>
          <span className="truncate">{data.author}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!data.isDraft && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="nodrag text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={saveState === "saving" || saveState === "deleting" || isEditedByOther}
              aria-label="Delete note"
              title="Delete note"
            >
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
            </Button>
          )}
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-background/45",
              saveState === "error" && "text-destructive",
              (saveState === "saving" || saveState === "deleting") && "text-primary",
              saveState === "idle" && "text-muted-foreground",
              saveState === "saved" && "text-primary",
            )}
            role="status"
            aria-label={saveMessage}
            title={saveMessage}
          >
            <HugeiconsIcon
              icon={
                saveState === "saved"
                  ? CheckmarkCircle02Icon
                  : saveState === "saving" || saveState === "deleting"
                    ? Loading03Icon
                    : saveState === "error"
                      ? Alert02Icon
                      : PencilEdit01Icon
              }
              size={14}
              strokeWidth={2}
              className={cn((saveState === "saving" || saveState === "deleting") && "animate-spin")}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
      </article>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            This note will be removed for everyone in the room. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep note</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => void removeNote()}>
            Delete note
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const nodeTypes = { "sticky-note": StickyNote };

function FlowControls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow<StickyNoteNode>();

  return (
    <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur-sm">
      <Button variant="ghost" size="icon-sm" onClick={() => zoomIn({ duration: 180 })} aria-label="Zoom in" title="Zoom in">
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => zoomOut({ duration: 180 })} aria-label="Zoom out" title="Zoom out">
        <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
      </Button>
      <span className="mx-1 h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={() => fitView({ duration: 220, padding: 0.2 })} aria-label="Fit view" title="Fit view">
        <HugeiconsIcon icon={Maximize02Icon} strokeWidth={2} />
        <span className="hidden sm:inline">Fit view</span>
      </Button>
    </div>
  );
}

function EmptyBoardState() {
  return (
    <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center p-6">
      <div className="max-w-xs rounded-2xl border border-dashed border-border bg-card/90 p-6 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
        </div>
        <h2 className="mt-4 text-sm font-semibold">This board is ready for ideas</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Add the first note to start shaping the conversation.</p>
      </div>
    </div>
  );
}

function RoomBoard({
  roomId,
  notes,
  memberNames,
  currentUserId,
  editingByNoteId,
  onEditingChange,
  onEditingEnd,
  onBroadcastNoteDrag,
  registerNoteDragListener,
}: {
  roomId: string;
  notes: Note[];
  memberNames: Map<string, string>;
  currentUserId: string;
  editingByNoteId: PresenceState["editingByNoteId"];
  onEditingChange: (noteId: string) => void;
  onEditingEnd: (noteId: string) => void;
  onBroadcastNoteDrag: (payload: NoteDragPayload) => void;
  registerNoteDragListener: (listener: (payload: NoteDragPayload) => void) => () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<StickyNoteNode>(notes.map((note) => toNoteNode(note, memberNames)));
  const [boardStatus, setBoardStatus] = useState("Ready to explore");
  const [draftId, setDraftId] = useState<string | null>(null);
  const { fitView } = useReactFlow<StickyNoteNode>();
  const draggingNoteIdRef = useRef<string | null>(null);
  const pendingDragRef = useRef<NoteDragPayload | null>(null);
  const dragFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return subscribeToRoomNotes(roomId, (payload) => {
      if (payload.eventType === "DELETE") {
        const deletedNoteId = payload.old.id;

        if (typeof deletedNoteId !== "string") {
          return;
        }

        setNodes((currentNodes) => currentNodes.filter((node) => node.id !== deletedNoteId));
        return;
      }

      const changedNote = payload.new;

      if (changedNote.room_id !== roomId) {
        return;
      }

      const changedNode = toNoteNode(changedNote, memberNames);

      setNodes((currentNodes) => {
        const existingNodeIndex = currentNodes.findIndex((node) => node.id === changedNode.id);
        const draftNodeIndex = currentNodes.findIndex(
          (node) =>
            node.data.isDraft &&
            node.data.roomId === changedNote.room_id &&
            node.data.body.trim() === changedNote.content &&
            node.position.x === changedNote.position_x &&
            node.position.y === changedNote.position_y,
        );

        if (payload.eventType === "INSERT" && draftNodeIndex !== -1) {
          return currentNodes.map((node, index) => (index === draftNodeIndex ? changedNode : node));
        }

        if (payload.eventType === "INSERT" || existingNodeIndex === -1) {
          return [...currentNodes.filter((node) => node.id !== changedNode.id), changedNode];
        }

        return currentNodes.map((node) => (node.id === changedNode.id ? changedNode : node));
      });
    });
  }, [memberNames, roomId, setNodes]);

  useEffect(() => {
    return registerNoteDragListener((payload) => {
      if (draggingNoteIdRef.current === payload.noteId) {
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === payload.noteId ? { ...node, position: payload.position } : node,
        ),
      );
    });
  }, [registerNoteDragListener, setNodes]);

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!draftId) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      void fitView({
        nodes: [{ id: draftId }],
        duration: 300,
        padding: 0.65,
        minZoom: 0.85,
        maxZoom: 1.35,
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [draftId, fitView]);

  const addNote = useCallback(() => {
    const existingDraft = nodes.find((node) => node.data.isDraft);

    if (existingDraft) {
      setDraftId(existingDraft.id);
      setBoardStatus("Finish your current note first");
      void fitView({ nodes: [{ id: existingDraft.id }], duration: 240, padding: 0.65, minZoom: 0.85, maxZoom: 1.35 });
      return;
    }

    const nextIndex = nodes.length;
    const position = {
      x: 140 + (nextIndex % 3) * 350,
      y: 100 + Math.floor(nextIndex / 3) * 240,
    };
    const id = `draft-${Date.now()}`;
    const color = noteColorOptions[Math.floor(Math.random() * noteColorOptions.length)];
    const draftNode: StickyNoteNode = {
      id,
      type: "sticky-note",
      position,
      data: {
        body: "",
        author: "You",
        color,
        isDraft: true,
        roomId,
      },
    };

    setNodes((currentNodes) => [...currentNodes, draftNode]);
    setDraftId(id);
    setBoardStatus("Write your note and press Enter to save");
  }, [fitView, nodes, roomId, setNodes]);

  const handleNodeDragStart = useCallback((_event: MouseEvent | TouchEvent, node: StickyNoteNode) => {
    draggingNoteIdRef.current = node.id;
    setBoardStatus("Dragging note");
  }, []);

  const handleNodeDrag: OnNodeDrag<StickyNoteNode> = useCallback((_event, node) => {
    if (node.data.isDraft) {
      return;
    }

    pendingDragRef.current = {
      noteId: node.id,
      userId: currentUserId,
      position: node.position,
    };

    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      const payload = pendingDragRef.current;
      pendingDragRef.current = null;

      if (payload) {
        onBroadcastNoteDrag(payload);
      }
    });
  }, [currentUserId, onBroadcastNoteDrag]);

  const handleNodeDragStop = useCallback(async (_event: MouseEvent | TouchEvent, node: StickyNoteNode) => {
    draggingNoteIdRef.current = null;

    if (!node.data.isDraft) {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }

      pendingDragRef.current = null;
      onBroadcastNoteDrag({
        noteId: node.id,
        userId: currentUserId,
        position: node.position,
      });
    }

    setBoardStatus("Saving note position…");
    const { error } = await updateNotePosition(node.id, node.position);
    setBoardStatus(error?.message ?? "Ready to explore");
  }, [currentUserId, onBroadcastNoteDrag]);

  const editingContextValue = useMemo(
    () => ({ currentUserId, editingByNoteId, onEditingChange, onEditingEnd }),
    [currentUserId, editingByNoteId, onEditingChange, onEditingEnd],
  );

  return (
    <RoomEditingContext.Provider value={editingContextValue}>
      <div className="relative h-full min-h-112 overflow-hidden rounded-2xl border border-border bg-muted/25 [background-image:radial-gradient(color-mix(in_oklch,var(--muted-foreground)_18%,transparent)_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center p-4">
        <div className="rounded-full border border-border bg-card/90 px-3 py-1.5 text-[0.65rem] text-muted-foreground shadow-sm backdrop-blur-sm">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
          {boardStatus}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button className="shadow-lg shadow-primary/15" onClick={addNote}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Add note
        </Button>
      </div>

      <ReactFlow<StickyNoteNode>
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.45}
        maxZoom={1.7}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
        className="bg-transparent!"
        aria-label="Collaborative sticky note board"
      >
        {nodes.length === 0 && <EmptyBoardState />}
      </ReactFlow>

        <FlowControls />
      </div>
    </RoomEditingContext.Provider>
  );
}

function MemberAvatar({ member, size = "default" }: { member: Member; size?: "default" | "sm" }) {
  return (
    <Avatar size={size}>
      <AvatarFallback className={cn(member.color, "font-semibold text-primary-foreground")}>{member.initials}</AvatarFallback>
      {member.active && <AvatarBadge className="bg-primary" />}
    </Avatar>
  );
}

function MembersPanel({ members, open, onToggle }: { members: Member[]; open: boolean; onToggle: () => void }) {
  if (!open) {
    return (
      <Button
        className="absolute top-4 left-4 z-20 border border-border bg-card/95 shadow-lg backdrop-blur-sm"
        variant="outline"
        size="icon"
        onClick={onToggle}
        aria-label="Open members panel"
        title="Open members panel"
      >
        <HugeiconsIcon icon={PanelRightOpenIcon} strokeWidth={2} />
        <span className="sr-only">{members.filter((member) => member.active).length} members online</span>
      </Button>
    );
  }

  return (
    <aside className="absolute top-4 left-4 z-20 w-60 overflow-hidden rounded-2xl border border-border bg-card/95 text-card-foreground shadow-xl backdrop-blur-md" aria-label="Room members">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-semibold">Members</p>
            <p className="text-[0.65rem] text-muted-foreground">{members.filter((member) => member.active).length} online now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label="Collapse members panel" title="Collapse members panel">
          <HugeiconsIcon icon={PanelRightCloseIcon} strokeWidth={2} />
        </Button>
      </div>
      <div className="space-y-1 p-2">
        {members.map((member) => (
          <div key={member.name} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted">
            <MemberAvatar member={member} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{member.name}</p>
              <p className="text-[0.65rem] text-muted-foreground">{member.role}</p>
            </div>
            <span
              className={cn("size-1.5 rounded-full", member.active ? "bg-primary" : "bg-muted-foreground/40")}
              aria-label={member.active ? "Online" : "Offline"}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

export function RoomPageClient({ roomId }: { roomId: string }) {
  const [membersOpen, setMembersOpen] = useState(true);
  const [shared, setShared] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [presence, setPresence] = useState<PresenceState>({ onlineUserIds: [], onlineCount: 0, editingByNoteId: {} });
  const presenceSubscriptionRef = useRef<RoomPresenceSubscription | null>(null);
  const remoteNoteDragListenerRef = useRef<((payload: NoteDragPayload) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadRoomData() {
      setIsLoading(true);
      setLoadError(null);
      setRoom(null);
      setNotes([]);
      setRoomMembers([]);
      setProfile(null);
      setPresence({ onlineUserIds: [], onlineCount: 0, editingByNoteId: {} });

      const roomResult = await getRoom(roomId);

      if (!isActive) {
        return;
      }

      if (roomResult.error || !roomResult.data) {
        setLoadError(roomResult.error?.message ?? "We couldn't load this room. Try again.");
        setIsLoading(false);
        return;
      }

      // getRoom joins the current user before the remaining helpers run. This
      // avoids concurrent join_room calls racing on a new membership insert.
      const [notesResult, membersResult, profileResult] = await Promise.all([
        getRoomNotes(roomId),
        getRoomMembers(roomId),
        getCurrentProfile(),
      ]);

      if (!isActive) {
        return;
      }

      const failedResult = [notesResult, membersResult, profileResult].find((result) => result.error);

      if (failedResult?.error) {
        setLoadError(failedResult.error.message);
        setIsLoading(false);
        return;
      }

      if (!notesResult.data || !membersResult.data || !profileResult.data) {
        setLoadError("We couldn't load this room. Try again.");
        setIsLoading(false);
        return;
      }

      setRoom(roomResult.data);
      setNotes(notesResult.data);
      setRoomMembers(membersResult.data);
      setProfile(profileResult.data);
      setIsLoading(false);
    }

    void loadRoomData();

    return () => {
      isActive = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const subscription = subscribeToRoomPresence(
      roomId,
      profile.id,
      profile.display_name,
      (nextPresence) => {
        setPresence(nextPresence);
        setRoomMembers((currentMembers) =>
          currentMembers.map((member) => ({
            ...member,
            online: nextPresence.onlineUserIds.includes(member.user_id),
          })),
        );
      },
      (payload) => remoteNoteDragListenerRef.current?.(payload),
    );

    presenceSubscriptionRef.current = subscription;

    return () => {
      if (presenceSubscriptionRef.current === subscription) {
        presenceSubscriptionRef.current = null;
      }

      remoteNoteDragListenerRef.current = null;

      subscription.unsubscribe();
    };
  }, [profile, roomId]);

  const broadcastNoteDrag = useCallback((payload: NoteDragPayload) => {
    presenceSubscriptionRef.current?.broadcastNoteDrag(payload);
  }, []);

  const registerNoteDragListener = useCallback((listener: (payload: NoteDragPayload) => void) => {
    remoteNoteDragListenerRef.current = listener;

    return () => {
      if (remoteNoteDragListenerRef.current === listener) {
        remoteNoteDragListenerRef.current = null;
      }
    };
  }, []);

  const onEditingChange = useCallback((noteId: string) => {
    presenceSubscriptionRef.current?.setEditingNote(noteId);
  }, []);

  const onEditingEnd = useCallback((noteId: string) => {
    presenceSubscriptionRef.current?.clearEditingNote(noteId);
  }, []);

  const members = useMemo(
    () => roomMembers.map((member, index) => toMember(member, index, new Set(presence.onlineUserIds))),
    [presence.onlineUserIds, roomMembers],
  );

  const memberNames = useMemo(
    () => new Map(roomMembers.map((member) => [member.user_id, member.display_name])),
    [roomMembers],
  );

  const shareRoom = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    }
  }, []);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="Back to CollabBoard home">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
            <span className="hidden text-xs font-medium sm:inline">Back</span>
          </Link>
          <span className="h-5 w-px bg-border" />
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/25">C</span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-sm font-semibold tracking-[-0.02em]">{room?.name ?? (isLoading ? "Loading room…" : "Room unavailable")}</h1>
            <p className="truncate text-[0.65rem] text-muted-foreground">Room / {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 sm:flex" aria-label={`${presence.onlineCount} users online`}>
            <AvatarGroup className="*:data-[slot=avatar]:ring-background">
              {members.slice(0, 3).map((member) => <MemberAvatar key={member.name} member={member} size="sm" />)}
            </AvatarGroup>
            <span className="text-xs text-muted-foreground">{presence.onlineCount} online</span>
          </div>
          <Button variant={shared ? "secondary" : "outline"} onClick={shareRoom} className="h-8 px-2.5 sm:px-3">
            <HugeiconsIcon icon={shared ? Copy01Icon : Share07Icon} strokeWidth={2} />
            <span className="hidden sm:inline">{shared ? "Room link copied" : "Share room"}</span>
            <span className="sm:hidden">{shared ? "Copied" : "Share"}</span>
          </Button>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 p-3 sm:p-4">
        {isLoading ? (
          <div className="flex h-full min-h-112 items-center justify-center rounded-2xl border border-border bg-muted/25">
            <p className="text-sm text-muted-foreground">Loading room data…</p>
          </div>
        ) : loadError ? (
          <div className="flex h-full min-h-112 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <div>
              <p className="text-sm font-medium text-destructive">{loadError}</p>
              <Link className="mt-3 inline-block text-xs font-medium text-muted-foreground underline underline-offset-4" href="/">
                Return home
              </Link>
            </div>
          </div>
        ) : (
          <ReactFlowProvider>
            <RoomBoard
              roomId={roomId}
              notes={notes}
              memberNames={memberNames}
              currentUserId={profile?.id ?? ""}
              editingByNoteId={presence.editingByNoteId}
              onEditingChange={onEditingChange}
              onEditingEnd={onEditingEnd}
              onBroadcastNoteDrag={broadcastNoteDrag}
              registerNoteDragListener={registerNoteDragListener}
            />
          </ReactFlowProvider>
        )}
        {!isLoading && !loadError ? <MembersPanel members={members} open={membersOpen} onToggle={() => setMembersOpen((current) => !current)} /> : null}
      </section>
    </main>
  );
}

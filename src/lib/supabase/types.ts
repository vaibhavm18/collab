export type RoomRole = "owner" | "member";

export type NoteColor = "primary" | "secondary" | "chart" | "muted";

export type NotePosition = {
  x: number;
  y: number;
};

export type NoteDragPayload = {
  noteId: string;
  userId: string;
  position: NotePosition;
};

export type Room = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

export type RoomMembership = {
  id: string;
  room_id: string;
  user_id: string;
  role: RoomRole;
  joined_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type RoomMember = RoomMembership & {
  display_name: string;
  online: boolean;
};

export type Note = {
  id: string;
  room_id: string;
  content: string;
  position_x: number;
  position_y: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  color: NoteColor;
};

export type PresencePayload = {
  userId: string;
  displayName: string;
  editingNoteId?: string;
};

export type PresenceEditor = {
  userId: string;
  displayName: string;
};

export type PresenceState = {
  onlineUserIds: string[];
  onlineCount: number;
  editingByNoteId: Record<string, PresenceEditor[]>;
};

export type DataAccessError = {
  message: string;
  code?: string;
  status?: number;
};

export type DataResult<T> = {
  data: T | null;
  error: DataAccessError | null;
};

export type Unsubscribe = () => void;

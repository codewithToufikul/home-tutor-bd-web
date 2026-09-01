import { baseApi } from './baseApi';

export interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'guardian' | 'tutor' | 'admin' | 'super_admin' | 'moderator' | 'coaching';
  status?: string;
  location?: string | { district?: string; area?: string };
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: ChatParticipant | string;
  receiverId: ChatParticipant | string;
  message: string;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationItem {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ success: boolean; data: ConversationItem[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Chat'],
    }),

    getMessages: builder.query<{ success: boolean; data: ChatMessage[]; meta?: any }, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { conversationId }) => [{ type: 'Chat', id: conversationId }],
    }),

    startConversation: builder.mutation<{ success: boolean; data: ConversationItem }, { targetUserId: string }>({
      query: ({ targetUserId }) => ({
        url: '/chat/conversations',
        method: 'POST',
        body: { targetUserId },
      }),
      invalidatesTags: ['Chat'],
    }),

    sendMessage: builder.mutation<
      { success: boolean; data: ChatMessage },
      { conversationId: string; receiverId: string; message: string; type?: string; attachments?: string[] }
    >({
      query: ({ conversationId, receiverId, message, type = 'text', attachments = [] }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { receiverId, message, type, attachments },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Chat', id: conversationId },
        'Chat',
      ],
    }),

    markAsRead: builder.mutation<{ success: boolean }, { conversationId: string }>({
      query: ({ conversationId }) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Chat'],
    }),

    getChatContacts: builder.query<{ success: boolean; data: ChatParticipant[] }, void>({
      query: () => '/chat/contacts',
      providesTags: ['Chat'],
    }),

    searchChatUsers: builder.query<{ success: boolean; data: ChatParticipant[] }, string>({
      query: (query) => ({
        url: '/chat/users',
        params: { query },
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useStartConversationMutation,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetChatContactsQuery,
  useLazySearchChatUsersQuery,
} = chatApi;

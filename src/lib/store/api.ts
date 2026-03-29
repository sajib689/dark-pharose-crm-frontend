/**
 * RTK Query API Service — Pharos Command CRM
 * All backend endpoints defined here as RTK Query endpoints.
 * Uses next-auth session token in every request via prepareHeaders.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const pharosApi = createApi({
  reducerPath: "pharosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: async (headers) => {
      // Attach JWT token from NextAuth session on every request
      const session = await getSession();
      const token = (session as any)?.accessToken;
      if (token) headers.set("authorization", `Bearer ${token}`);
      headers.set("content-type", "application/json");
      return headers;
    },
  }),

  // Cache tag types for automatic cache invalidation
  tagTypes: ["Projects", "Team", "KPI", "Earnings", "Notifications", "Dashboard", "Reports", "DailyReports"],

  endpoints: (builder) => ({
    // ─── DASHBOARD ─────────────────────────────────────────────
    getDashboardStats: builder.query<any, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getRecentProjects: builder.query<any[], void>({
      query: () => "/dashboard/recent-projects",
      providesTags: ["Dashboard"],
    }),

    // ─── PROJECTS ──────────────────────────────────────────────
    getProjects: builder.query<any, { 
      status?: string; 
      priority?: string; 
      platform?: string; 
      search?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.set("status", params.status);
        if (params.priority) q.set("priority", params.priority);
        if (params.platform) q.set("platform", params.platform);
        if (params.search) q.set("search", params.search);
        if (params.page) q.set("page", params.page.toString());
        if (params.limit) q.set("limit", params.limit.toString());
        if (params.startDate) q.set("startDate", params.startDate);
        if (params.endDate) q.set("endDate", params.endDate);
        return `/projects${q.toString() ? `?${q}` : ""}`;
      },
      providesTags: ["Projects"],
    }),
    getMyProjects: builder.query<any, void>({
      query: () => "/projects/me",
      providesTags: ["Projects"],
    }),
    getProjectById: builder.query<any, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Projects", id }],
    }),
    createProject: builder.mutation<any, any>({
      query: (body) => ({ url: "/projects", method: "POST", body }),
      invalidatesTags: ["Projects", "Dashboard"],
    }),
    updateProject: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/projects/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_res, _err, { id }) => ["Projects", "Dashboard", { type: "Projects", id }],
    }),
    updateProjectStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/projects/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Projects", "Dashboard"],
    }),
    updateProjectPayment: builder.mutation<any, { id: string; currentPayment: number }>({
      query: ({ id, currentPayment }) => ({ url: `/projects/${id}/payment`, method: "PATCH", body: { currentPayment } }),
      invalidatesTags: ["Projects", "Earnings", "Dashboard"],
    }),
    deleteProject: builder.mutation<any, string>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Projects", "Dashboard"],
    }),

    // ─── TEAM ──────────────────────────────────────────────────
    getTeam: builder.query<any[], void>({
      query: () => "/team",
      transformResponse: (response: { teams: any[] }) => response.teams,
      providesTags: ["Team"],
    }),
    getTeamMember: builder.query<any, string>({
      query: (id) => `/team/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Team", id }],
    }),
    createTeamMember: builder.mutation<any, any>({
      query: (body) => ({ url: "/team", method: "POST", body }),
      invalidatesTags: ["Team"],
    }),
    updateTeamMember: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/team/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Team"],
    }),
    toggleMemberStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/team/${id}/status`, method: "PATCH", body: { isActive } }),
      invalidatesTags: ["Team"],
    }),
    resetMemberPassword: builder.mutation<any, { id: string; password: string }>({
      query: ({ id, password }) => ({ url: `/team/${id}/password`, method: "PATCH", body: { password } }),
      invalidatesTags: ["Team"],
    }),
    updateMemberRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/team/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ["Team"],
    }),
    deleteTeamMember: builder.mutation<any, string>({
      query: (id) => ({ url: `/team/${id}`, method: "DELETE" }),
      invalidatesTags: ["Team"],
    }),

    // ─── KPI ───────────────────────────────────────────────────
    getKpiSettings: builder.query<any, void>({
      query: () => "/kpi",
      providesTags: ["KPI"],
    }),
    updateKpiSettings: builder.mutation<any, { frontendPct: number; uiuxPct: number; backendPct: number; appDevPct: number }>({
      query: (body) => ({ url: "/kpi", method: "PUT", body }),
      invalidatesTags: ["KPI"],
    }),
    getKpiEarnings: builder.query<any, { month?: string; year?: string; userId?: string; page?: number; limit?: number }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.month) q.set("month", params.month);
        if (params.year) q.set("year", params.year);
        if (params.userId) q.set("userId", params.userId);
        if (params.page) q.set("page", params.page.toString());
        if (params.limit) q.set("limit", params.limit.toString());
        return `/kpi/earnings${q.toString() ? `?${q}` : ""}`;
      },
      providesTags: ["Earnings"],
    }),
    getMyEarnings: builder.query<any, void>({
      query: () => "/kpi/earnings/me",
      providesTags: ["Earnings"],
    }),
    updateEarning: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/kpi/earnings/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["Earnings", "Notifications"],
    }),
    markEarningPaid: builder.mutation<any, string>({
      query: (id) => ({ url: `/kpi/earnings/${id}/pay`, method: "PATCH" }),
      invalidatesTags: ["Earnings", "Notifications"],
    }),

    // ─── NOTIFICATIONS ─────────────────────────────────────────
    getNotifications: builder.query<any, void>({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    dismissNotification: builder.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),

    // ─── REPORTS ───────────────────────────────────────────────
    getReportsSummary: builder.query<any, void>({
      query: () => "/reports/summary",
      providesTags: ["Reports"],
    }),

    // ─── SYNC ──────────────────────────────────────────────────
    syncProjects: builder.mutation<{ message: string; count: number }, void>({
      query: () => ({ url: "/sync/projects", method: "POST" }),
      invalidatesTags: ["Projects", "Dashboard", "KPI", "Earnings"],
    }),
    syncMembers: builder.mutation<{ message: string; count: number }, void>({
      query: () => ({ url: "/sync/members", method: "POST" }),
      invalidatesTags: ["Team", "Dashboard"],
    }),

    // ─── DAILY REPORTS ─────────────────────────────────────────
    getDailyReports: builder.query<any, { date?: string; userId?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.date) q.set("date", params.date);
        if (params.userId) q.set("userId", params.userId);
        return `/daily-reports/admin${q.toString() ? `?${q}` : ""}`;
      },
      providesTags: ["DailyReports"],
    }),
    getMyDailyReports: builder.query<any, void>({
      query: () => "/daily-reports/my",
      providesTags: ["DailyReports"],
    }),
    submitDailyReport: builder.mutation<any, { type: "SOD" | "EOD"; content: string; mood: string }>({
      query: (body) => ({ url: "/daily-reports", method: "POST", body }),
      invalidatesTags: ["DailyReports"],
    }),

    // ─── USER ──────────────────────────────────────────────────
    getUserProfile: builder.query<any, void>({
      query: () => "/users/profile",
      providesTags: ["Dashboard"],
    }),
    updateUserProfile: builder.mutation<any, any>({
      query: (body) => ({ url: "/users/profile", method: "PUT", body }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

// Auto-generated hooks — import these in your components
export const {
  // Dashboard
  useGetDashboardStatsQuery,
  useGetRecentProjectsQuery,
  // Projects
  useGetProjectsQuery,
  useGetMyProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
  useUpdateProjectPaymentMutation,
  useDeleteProjectMutation,
  // Team
  useGetTeamQuery,
  useGetTeamMemberQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useToggleMemberStatusMutation,
  useResetMemberPasswordMutation,
  useUpdateMemberRoleMutation,
  useDeleteTeamMemberMutation,
  // KPI
  useGetKpiSettingsQuery,
  useUpdateKpiSettingsMutation,
  useGetKpiEarningsQuery,
  useGetMyEarningsQuery,
  useUpdateEarningMutation,
  useMarkEarningPaidMutation,
  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDismissNotificationMutation,
  // Reports
  useGetReportsSummaryQuery,
  // Sync
  useSyncProjectsMutation,
  useSyncMembersMutation,
  // Daily Reports
  useGetDailyReportsQuery,
  useGetMyDailyReportsQuery,
  useSubmitDailyReportMutation,
  // User
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = pharosApi;

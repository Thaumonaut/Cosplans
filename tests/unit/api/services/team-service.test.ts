import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  Team,
  TeamCreate,
  TeamInvite,
  TeamMember,
  TeamRole,
} from "$lib/types/domain/team";

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock("$lib/supabase", () => ({
  supabase: mockSupabase,
}));

// Helper to create a chainable mock query builder
function createQueryBuilder(returnValue: any = { error: null }) {
  const chain: any = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(returnValue)),
    maybeSingle: vi.fn(() => Promise.resolve(returnValue)),
    order: vi.fn(() => Promise.resolve(returnValue)),
  };

  // Make update and delete return chainable objects
  chain.update = vi.fn(() => chain);
  chain.delete = vi.fn(() => chain);

  return chain;
}

describe("teamService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a team with owner as member", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      mockSupabase.rpc.mockResolvedValue({
        data: [
          {
            id: "team1",
            name: "Test Team",
            owner_id: "user1",
            is_personal: false,
            type: "private",
            created_by: "user1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        error: null,
      });

      // Mock team_members check - no existing member
      const memberChain = createQueryBuilder({
        data: null,
        error: { code: "PGRST116" },
      });
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "team_members") return memberChain;
        return createQueryBuilder();
      });

      const result = await teamService.create({
        name: "Test Team",
        type: "private",
      });

      expect(result.name).toBe("Test Team");
      expect(result.type).toBe("private");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("create_team_safe", {
        team_name: "Test Team",
        creator_id: "user1",
        team_type: "private",
      });
    });

    it("should prevent creating multiple personal teams", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Mock existing personal team
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "existing-team" },
                error: null,
              }),
            })),
          })),
        })),
      }));
      mockSupabase.from = mockFrom;

      await expect(
        teamService.create({ name: "Personal Team", type: "personal" }),
      ).rejects.toThrow("You already have a personal team");
    });
  });

  describe("invite", () => {
    it("should invite a user to a team with status=invited", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockUserQuery = createQueryBuilder({
        data: { id: "user2" },
        error: null,
      });
      const mockMemberQuery = createQueryBuilder({
        data: null,
        error: { code: "PGRST116" },
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "users") return mockUserQuery;
        if (table === "team_members") {
          const chain = createQueryBuilder({
            data: null,
            error: { code: "PGRST116" },
          });
          chain.insert = mockInsert;
          return chain;
        }
        return createQueryBuilder();
      });

      await teamService.invite("team1", {
        email: "user2@example.com",
        role: "editor",
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          team_id: "team1",
          user_id: "user2",
          role: "editor",
          status: "invited",
          invited_by: "user1",
        }),
      );
    });

    it("should throw error if user already exists as member", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockUserQuery = createQueryBuilder({
        data: { id: "user2" },
        error: null,
      });
      const mockMemberQuery = createQueryBuilder({
        data: { id: "existing-member" },
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "users") return mockUserQuery;
        if (table === "team_members") return mockMemberQuery;
        return createQueryBuilder();
      });

      await expect(
        teamService.invite("team1", {
          email: "user2@example.com",
          role: "editor",
        }),
      ).rejects.toThrow("User is already a member");
    });
  });

  describe("acceptInvite", () => {
    it("should update invitation status from invited to active", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user2" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const updateSpy = vi.fn();
      const findChain = createQueryBuilder({
        data: {
          id: "invite1",
          team_id: "team1",
          user_id: "user2",
          status: "invited",
        },
        error: null,
      });

      // Create update chain that tracks the update call and supports multiple .eq() calls
      const updateChain: any = {
        update: vi.fn((data) => {
          updateSpy(data);
          return updateChain;
        }),
        eq: vi.fn(() => updateChain), // Return chain to support chaining
      };
      // Final call should resolve to { error: null }
      updateChain.eq = vi.fn((field: string, value: any) => {
        if (field === "user_id") {
          return Promise.resolve({ error: null });
        }
        return updateChain;
      });

      let callCount = 0;
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "team_members") {
          callCount++;
          // First call is for finding the invitation, second is for updating
          if (callCount === 1) return findChain;
          return updateChain;
        }
        return createQueryBuilder();
      });

      await teamService.acceptInvite("team1");

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          joined_at: expect.any(String),
        }),
      );
    });

    it("should throw error if invitation not found", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user2" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockQuery = createQueryBuilder({
        data: null,
        error: { code: "PGRST116" },
      });

      mockSupabase.from = vi.fn(() => mockQuery);

      await expect(teamService.acceptInvite("team1")).rejects.toThrow(
        "Invitation not found",
      );
    });
  });

  describe("updateMemberRole", () => {
    it("should update member role (owner only)", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const updateSpy = vi.fn();
      const updateChain: any = {
        update: vi.fn((data) => {
          updateSpy(data);
          return updateChain;
        }),
      };
      // Support multiple .eq() calls - last one resolves
      updateChain.eq = vi.fn((field: string, value: any) => {
        if (field === "user_id") {
          return Promise.resolve({ error: null });
        }
        return updateChain;
      });

      mockSupabase.from = vi.fn(() => updateChain);

      await teamService.updateMemberRole("team1", "user2", "editor");

      expect(updateSpy).toHaveBeenCalledWith({ role: "editor" });
    });
  });

  describe("removeMember", () => {
    it("should remove a member from team", async () => {
      const { teamService } = await import("$lib/api/services/teamService");
      const mockUser = { id: "user1" };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const deleteSpy = vi.fn();
      const deleteChain: any = {
        delete: vi.fn(() => {
          deleteSpy();
          return deleteChain;
        }),
      };
      // Support multiple .eq() calls - last one resolves
      deleteChain.eq = vi.fn((field: string, value: any) => {
        if (field === "user_id") {
          return Promise.resolve({ error: null });
        }
        return deleteChain;
      });

      mockSupabase.from = vi.fn(() => deleteChain);

      await teamService.removeMember("team1", "user2");

      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe("getMembers", () => {
    it("should return team members with user profiles", async () => {
      const { teamService } = await import("$lib/api/services/teamService");

      const mockMembers = [
        {
          id: "m1",
          team_id: "team1",
          user_id: "user1",
          role: "owner",
          status: "active",
        },
        {
          id: "m2",
          team_id: "team1",
          user_id: "user2",
          role: "editor",
          status: "active",
        },
      ];

      const mockUsers = [
        { id: "user1", name: "User 1", email: "user1@example.com" },
        { id: "user2", name: "User 2", email: "user2@example.com" },
      ];

      let callCount = 0;
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "team_members") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockMembers,
              error: null,
            }),
          };
        }
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
            }),
          };
        }
        return {};
      });

      const members = await teamService.getMembers("team1");

      expect(members.length).toBe(2);
      expect(members[0].role).toBe("owner");
      expect(members[1].role).toBe("editor");
    });
  });
});

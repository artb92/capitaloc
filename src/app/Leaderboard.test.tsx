// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useLang } from "@/features/i18n/useI18n";
import { Leaderboard } from "./Leaderboard";

const result = { total: 5000, guesses: [] };
const row = (id: number, name: string, score: number) => ({ id, name, score, time_ms: 12_000 });

beforeEach(() => {
  localStorage.clear();
  useLang.setState({ lang: "en" });
});
afterEach(() => vi.unstubAllGlobals());

describe("Leaderboard", () => {
  it("joins today's board and highlights the new row", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json([row(1, "Zoé", 9000)]))
      .mockResolvedValueOnce(Response.json({ id: 2, score: 5000, time_ms: 12_000, rank: 2 }))
      .mockResolvedValueOnce(Response.json([row(1, "Zoé", 9000), row(2, "Arthur", 5000)]));
    vi.stubGlobal("fetch", fetch);
    render(<Leaderboard day="2026-10-15" result={result} />);
    expect(await screen.findByText("Zoé")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: " Arthur " } });
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    const mine = await screen.findByText("Arthur");
    expect(mine.closest("li")).toHaveClass("bg-accent/20");
    expect(screen.queryByLabelText("Your name")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("capitaloc:board:v1") ?? "{}").name).toBe("Arthur");
  });

  it("refuses a bad name without calling the server", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetch);
    render(<Leaderboard day="2026-10-15" result={result} />);
    await screen.findByText("No one here yet.");
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(screen.getByText(/2 to 16 letters/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("browses back to an earlier day", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetch);
    render(<Leaderboard day="2026-10-15" result={result} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    expect(screen.getByText("Daily #3 leaderboard")).toBeInTheDocument();
    await waitFor(() => expect(String(fetch.mock.lastCall?.[0])).toContain("day=eq.2026-10-14"));
    expect(screen.queryByLabelText("Your name")).not.toBeInTheDocument();
  });
});

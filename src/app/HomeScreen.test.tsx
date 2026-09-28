// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useLang } from "@/features/i18n/useI18n";
import { HomeScreen } from "./HomeScreen";

describe("HomeScreen", () => {
  it("explains the rules and starts the game", () => {
    useLang.setState({ lang: "en" });
    const onStart = vi.fn();
    render(<HomeScreen onStart={onStart} />);
    expect(screen.getByText(/5 seconds/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("switches to French", () => {
    useLang.setState({ lang: "fr" });
    render(<HomeScreen onStart={() => {}} />);
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import CandidateSimulationContent from "./CandidateSimulationContent";
import { CandidateSessionProvider } from "../CandidateSessionProvider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<CandidateSessionProvider>{ui}</CandidateSessionProvider>);
}

describe("CandidateSimulationContent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("valid token loads intro screen with correct title/role and start button", async () => {
    (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidateSessionId: 123,
        status: "in_progress",
        simulation: { title: "Backend Engineer Simulation", role: "Backend Engineer" },
      }),
    });

    renderWithProvider(<CandidateSimulationContent token="VALID_TOKEN" />);

    expect(
      await screen.findByText("Backend Engineer Simulation")
    ).toBeInTheDocument();
    expect(screen.getByText(/Role:\s*Backend Engineer/i)).toBeInTheDocument();

    const startBtn = screen.getByRole("button", { name: /start simulation/i });
    expect(startBtn).toBeInTheDocument();

    fireEvent.click(startBtn);
    expect(await screen.findByText(/Starting/i)).toBeInTheDocument();
  });

  it("invalid token shows friendly error and no task UI", async () => {
    (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    renderWithProvider(<CandidateSimulationContent token="INVALID_TOKEN" />);

    expect(
      await screen.findByText(/Unable to load simulation/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /start simulation/i })
    ).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("network errors show retry and retry succeeds", async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidateSessionId: 999,
          status: "in_progress",
          simulation: { title: "Sim", role: "Backend Engineer" },
        }),
      });

    (global.fetch as unknown as jest.Mock) = fetchMock;

    renderWithProvider(<CandidateSimulationContent token="VALID_TOKEN" />);

    expect(
      await screen.findByText(/Unable to load simulation/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(await screen.findByText("Sim")).toBeInTheDocument();
    expect(screen.getByText(/Role:\s*Backend Engineer/i)).toBeInTheDocument();
  });
});

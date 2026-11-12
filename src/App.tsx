import StaffingDashboardPreview from "./components/StaffingDashboardPreview";
import HeadcountPage from "./pages/HeadcountPage";

function App() {
  const showReactHeadcount =
    new URLSearchParams(window.location.search).get("view") === "headcount";

  return showReactHeadcount
    ? <HeadcountPage />
    : <StaffingDashboardPreview />;
}

export default App;
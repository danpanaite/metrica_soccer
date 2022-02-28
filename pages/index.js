import dynamic from "next/dynamic";

const SoccerTrackingChart = dynamic(() => import("../charts/SoccerTracking_Live"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col w-full h-screen items-center justify-center">
      <h1 className="text-3xl font-bold underline mb-4"> Soccer Tracking!</h1>
      <div className="relative w-1/2 h-1/2">
        <div className="h-1/2">
          <SoccerTrackingChart />
        </div>
      </div>
    </div>
  );
}

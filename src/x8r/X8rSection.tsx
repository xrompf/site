import Profile from "./Profile";
import { SpotifyCard } from "./Activity";
import Projects from "./Projects";
import Buttons from "./Buttons";
import { useLanyard } from "./lib/lanyard";

export default function X8rSection() {
  const p = useLanyard();

  return (
    <section className="block x8r-section" id="profile">
      <div className="wrap">
        <div className="head">
          <span className="kicker">Creator</span>
          <h2>xrompf · Activity &amp; Projects</h2>
          <p>Live presence, music, open APIs, and 88×31 web buttons styled with your active Material theme.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <Profile />
          <div className="min-w-0 space-y-4">
            <SpotifyCard sp={p.spotify} />
            <Projects />
          </div>
        </div>

        <Buttons />
      </div>
    </section>
  );
}
